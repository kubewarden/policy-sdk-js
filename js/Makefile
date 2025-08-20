.PHONY: build unit-tests clean

build:
	npm install
	npm run build

unit-tests:
	npm run test

clean:
	rm -rf node_modules dist

check-plugin:
	@echo "Checking if plugin files exist..."
	@if [ ! -f "./plugin/javy-plugin-kubewarden.wasm" ]; then \
		echo "Error: Plugin file './plugin/javy-plugin-kubewarden.wasm' not found. Run 'make build-plugin' from root directory first."; \
		exit 1; \
	fi
	@echo "Plugin file found ✓"