FROM alpine:latest AS certs
RUN apk --update add ca-certificates

FROM golang:1.21 AS build

WORKDIR /src/server

COPY server/go.mod server/go.sum ./

# download the dependencies in a separate step.
# this caches the dependencies in a separate layer
# to speed up build times.
RUN go mod download

COPY server .

# disable CGO to ensure the binary is fully linked and can run
# from a scratch image.
RUN CGO_ENABLED=0 GOOS=linux go build -C /src/server -o /dist/recipie


FROM scratch

COPY --from=certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /dist/recipie /dist/recipie

EXPOSE 8090

CMD ["/dist/recipie", "serve", "--http=0.0.0.0:8090"]