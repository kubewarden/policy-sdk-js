SOURCE_FILES := $(shell find . -name '*.ts')
KUBEWARDEN_PLUGIN := $(shell find ../javy-plugin-kubewarden -name 'javy-plugin-kubewarden.wasm')

.PHONY: build
build: dist/policy.wasm

dist/policy.wasm: $(SOURCE_FILES) $(KUBEWARDEN_PLUGIN)
	npm run build
	javy build dist/bundle.js -C plugin=$(KUBEWARDEN_PLUGIN) -o dist/policy.wasm

annotated-policy.wasm: dist/policy.wasm metadata.yml
	kwctl annotate -m metadata.yml -u README.md -o annotated-policy.wasm ./dist/policy.wasm

e2e-tests: annotated-policy.wasm
	bats e2e.bats

clean:
	rm -f dist/*
	rm -f annotated-policy.wasm