# ╔════════════════════════════════════════════════════════════════════════════╗
# ║                                                                            ║
# ║                      \  |       |          _|_) |                          ║
# ║                     |\/ |  _` | |  /  _ \ |   | |  _ \                     ║
# ║                     |   | (   |   <   __/ __| | |  __/                     ║
# ║                    _|  _|\__,_|_|\_\\___|_|  _|_|\___|                     ║
# ║                                                                            ║
# ║           * github.com/paperwork * twitter.com/paperworkcloud *            ║
# ║                                                                            ║
# ╚════════════════════════════════════════════════════════════════════════════╝
.PHONY: help build run local-build local-build-develop local-run local-run-develop

APP_NAME ?= "web" ##@Variables The service name
APP_VSN ?= `grep '"version":' package.json | sed 's/.*"\([0-9]*\.[0-9]\.[0-9]*\)".*/\1/'` ##@Variables The service version
BUILD ?= `git rev-parse --short HEAD` ##@Variables The build hash

FN_HELP = \
	%help; while(<>){push@{$$help{$$2//'options'}},[$$1,$$3] \
		if/^([\w-]+)\s*(?:).*\#\#(?:@(\w+))?\s(.*)$$/}; \
	print"$$_:\n", map"  $$_->[0]".(" "x(20-length($$_->[0])))."$$_->[1]\n",\
	@{$$help{$$_}},"\n" for keys %help; \

help: ##@Miscellaneous Show this help
	@echo "Usage: make [target] <var> ...\n"
	@echo "$(strip $(APP_NAME)):$(strip $(APP_VSN))-$(strip $(BUILD))"
	@perl -e '$(FN_HELP)' $(MAKEFILE_LIST)

build: ##@Docker Build service
	docker build --build-arg APP_NAME="$(strip $(APP_NAME))" \
		--build-arg APP_VSN="$(strip $(APP_VSN))" \
		-t "$(strip $(APP_NAME)):$(strip $(APP_VSN))-$(strip $(BUILD))" \
		-t "$(strip $(APP_NAME)):latest" .

run: ##@Docker Run service locally
	docker run --env-file config/docker.env \
		--rm -it "$(strip $(APP_NAME)):latest"

local-build-develop: ##@Local Build service (target: dev) locally
	yarn install
	./node_modules/@angular/cli/bin/ng build

local-build: ##@Local Build service (target: prod) locally
	yarn install
	./node_modules/@angular/cli/bin/ng build --prod

local-run-develop: ##@Local Run service (target: dev) locally
	./node_modules/@angular/cli/bin/ng serve --host 0.0.0.0 --disable-host-check --open

local-run: ##@Local Run service (target: prod) locally
	./node_modules/@angular/cli/bin/ng serve --host 0.0.0.0 --disable-host-check --prod --open
