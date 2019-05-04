web
===
[<img src="https://img.shields.io/docker/cloud/build/paperwork/web.svg?style=for-the-badge"/>](https://hub.docker.com/r/paperwork/web)

Paperwork Web UI

## General

This is a first try to build a web UI for Paperwork 2, based on Angular (7.x) and Material components.

## Getting involved

**Are you a front-end developer looking for a fun opensource project? I could use some help on this, [get in touch](mailto:marius@paperwork.cloud?subject=Paperwork%20Web%20UI)!**

## Current state

![Current state](docs/current-state-01.png)

![Current state](docs/current-state-02.png)

## Docker

### Environment Options

- `PAPERWORK_API_GATEWAY_PROTOCOL`: The protocol the front-end should communicate with the `service-gateway`, `http` or `https`.
- `PAPERWORK_API_GATEWAY_HOST_PORT`: The host/port combination under which the front-end can reach the `service-gateway`, e.g. `api.mydomain.com:8080`. If you're using a standard port (`80` for `http` and `443` for `https`) you can simply specify `api.mydomain.com` here.

## Development

### Development server

Run `make local-run-develop` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files. Use `make local-run` for a production build.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Building

Run `make local-build-develop` to build the project. The build artifacts will be stored in the `dist/` directory. Use `make local-build` for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
