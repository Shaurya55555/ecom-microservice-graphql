FROM golang:1.22 AS build
WORKDIR /src
COPY go.mod ./
COPY *.go ./
RUN go mod tidy && CGO_ENABLED=0 go build -o /notification-service .

FROM gcr.io/distroless/static-debian12
COPY --from=build /notification-service /notification-service
EXPOSE 3004
ENTRYPOINT ["/notification-service"]
