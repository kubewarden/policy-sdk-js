use javy_plugin_api::{
    javy::{
        quickjs::{prelude::Func, Error, Object},
        Runtime,
    },
    javy_plugin, Config,
};

wit_bindgen::generate!({
    world: "kubewarden-plugin",
    generate_all
});

fn config() -> Config {
    let mut config = Config::default();
    config.text_encoding(true).javy_stream_io(true);

    config
}

fn modify_runtime(runtime: Runtime) -> Runtime {
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

                    crate::kubewarden::wasip2::host::call(&binding, &ns, &op, msg)
                        .map_err(|_| Error::Unknown)
                }),
            )
        })
        .unwrap();
    runtime
}

struct Component;

// Dynamically linked modules will use `my_javy_plugin_v1` as the import
// namespace.
javy_plugin!("kubewarden-plugin", Component, config, modify_runtime);

export!(Component);
