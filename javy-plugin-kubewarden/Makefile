OUTPUT_DIR = ../js/plugin

.PHONY: build
build:
	cargo build --target=wasm32-wasip2 --release
	javy init-plugin target/wasm32-wasip2/release/javy_plugin_kubewarden.wasm -o $(OUTPUT_DIR)/javy-plugin-kubewarden.wasm

.PHONY: clean
clean:
	cargo clean
