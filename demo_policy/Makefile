SOURCE_FILES := $(shell find . -name '*.ts')
KUBEWARDEN_PLUGIN := ../js/plugin/javy-plugin-kubewarden.wasm

.PHONY: build annotated-policy.wasm e2e-tests clean

build: dist/policy.wasm

dist/policy.wasm: $(SOURCE_FILES) $(KUBEWARDEN_PLUGIN)
	npm install
	npm run build
	javy build dist/bundle.js -C plugin=$(KUBEWARDEN_PLUGIN) -o dist/policy.wasm

annotated-policy.wasm: dist/policy.wasm metadata.yml
	kwctl annotate -m metadata.yml -u README.md -o annotated-policy.wasm dist/policy.wasm

e2e-tests: annotated-policy.wasm
	bats e2e.bats

clean:
	rm -rf dist annotated-policy.wasm