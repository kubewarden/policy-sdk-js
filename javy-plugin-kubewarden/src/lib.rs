use javy_plugin_api::javy::quickjs::{prelude::Func, Error, Object};
use javy_plugin_api::{import_namespace, Config};

import_namespace!("kubewarden");

#[link(wasm_import_module = "host")]
extern "C" {
    /// The host's exported __host_call function.
    pub(crate) fn call(
        bd_ptr: *const u8,
        bd_len: usize,
        ns_ptr: *const u8,
        ns_len: usize,
        op_ptr: *const u8,
        op_len: usize,
        ptr: *const u8,
        len: usize,
    ) -> usize;
}

#[export_name = "initialize_runtime"]
pub extern "C" fn initialize_runtime() {
    let mut config = Config::default();
    config.text_encoding(true).javy_stream_io(true);

    javy_plugin_api::initialize_runtime(config, |runtime| {
        runtime
            .context()
            .with(|ctx| {
                ctx.globals().set(
                    "policyAction",
                    Func::from(|| {
                        let args = std::env::args().collect::<Vec<String>>();
                        if args.len() != 2 {
                            // TODO: move to Error::UserData when javy upgrades to latest version of rquickjs
                            return Err(Error::Unknown);
                        }
                        Ok(args[1].clone())
                    }),
                )
            })
            .unwrap();
        runtime
            .context()
            .with(|ctx| {
                ctx.globals().set(
                    "__hostCall",
                    Func::from(|binding: String, ns: String, op: String, msg: Object| {
                        let msg = msg
                            .as_array_buffer()
                            .and_then(|ab| ab.as_bytes())
                            .ok_or(Error::Unknown)?; // TODO: move to Error::UserData when javy upgrades to latest version of rquickjs

                        let successful = unsafe {
                            call(
                                binding.as_ptr(),
                                binding.len(),
                                ns.as_ptr(),
                                ns.len(),
                                op.as_ptr(),
                                op.len(),
                                msg.as_ptr(),
                                msg.len(),
                            )
                        };

                        Ok::<bool, Error>(successful == 0)
                    }),
                )
            })
            .unwrap();
        runtime
    })
    .unwrap();
}
