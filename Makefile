.PHONY: all build-plugin build-policy e2e-tests

all: build-plugin build-policy

build-plugin:
	$(MAKE) -C javy-plugin-kubewarden build

build-policy:
	$(MAKE) -C js annotated-policy.wasm

e2e-tests: all
	$(MAKE) -C js e2e-tests

clean:
	$(MAKE) -C javy-plugin-kubewarden clean
	$(MAKE) -C js clean
