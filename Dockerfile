# ╔════════════════════════════════════════════════════════════════════════════╗
# ║                                                                            ║
# ║                 __ \             |               _|_) |                    ║
# ║                 |   |  _ \   __| |  /  _ \  __| |   | |  _ \               ║
# ║                 |   | (   | (      <   __/ |    __| | |  __/               ║
# ║                ____/ \___/ \___|_|\_\\___|_|   _|  _|_|\___|               ║
# ║                                                                            ║
# ║           * github.com/paperwork * twitter.com/paperworkcloud *            ║
# ║                                                                            ║
# ╚════════════════════════════════════════════════════════════════════════════╝

# We have to use Node 11 instead of the latest, because node-sass is only
# compatible with Node 12 from v4.12.0 upwards but
# @angular-devkit/build-angular hasn't updated to node-sass@4.12.0 or newer yet.
FROM node:11-alpine AS builder

ARG APP_NAME
ARG APP_VSN
ARG BUILD

ENV APP_NAME=${APP_NAME} \
    APP_VSN=${APP_VSN} \
    BUILD=${BUILD}

RUN apk update \
 && apk upgrade --no-cache \
 && apk add --no-cache make python g++ yarn git

WORKDIR /app
COPY . .

RUN make local-build

FROM nginx:alpine

RUN apk update \
 && apk upgrade --no-cache \
 && apk add --no-cache jq

COPY --from=builder /app/dist/* /usr/share/nginx/html/
COPY --from=builder /app/nginx-wrapper.sh /usr/bin/nginx-wrapper.sh
RUN echo "{\"name\":\"$APP_NAME\", \"version\":\"$APP_VSN\", \"build\":\"$BUILD\"}" > /usr/share/nginx/html/.env.json

CMD ["/usr/bin/nginx-wrapper.sh", "/usr/share/nginx/html/.env.json"]
