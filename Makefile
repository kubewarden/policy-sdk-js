.PHONY: all build-plugin build-policy e2e-tests unit-tests all-tests

all: build-plugin build-policy

build-plugin:
	$(MAKE) -C javy-plugin-kubewarden build

build-policy:
	$(MAKE) -C demo_policy annotated-policy.wasm

e2e-tests: all
	$(MAKE) -C demo_policy e2e-tests

unit-tests:
	$(MAKE) -C js unit-tests

all-tests: unit-tests e2e-tests

clean:
	$(MAKE) -C javy-plugin-kubewarden clean
	$(MAKE) -C js clean
	$(MAKE) -C demo_policy clean
