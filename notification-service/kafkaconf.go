package main

import (
	"crypto/tls"
	"fmt"
	"os"
	"time"

	"github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl"
	"github.com/segmentio/kafka-go/sasl/plain"
	"github.com/segmentio/kafka-go/sasl/scram"
)

// kafkaSecurity builds the SASL mechanism and TLS config from the environment.
// Local Docker runs without either; a managed Kafka sets KAFKA_SASL_USERNAME
// (and optionally KAFKA_SASL_MECHANISM=plain|scram-sha-256|scram-sha-512).
func kafkaSecurity() (sasl.Mechanism, *tls.Config, error) {
	user := os.Getenv("KAFKA_SASL_USERNAME")
	var tlsCfg *tls.Config
	if user != "" || os.Getenv("KAFKA_TLS") == "true" {
		tlsCfg = &tls.Config{MinVersion: tls.VersionTLS12}
	}
	if user == "" {
		return nil, tlsCfg, nil
	}
	pass := os.Getenv("KAFKA_SASL_PASSWORD")
	switch m := env("KAFKA_SASL_MECHANISM", "plain"); m {
	case "plain":
		return plain.Mechanism{Username: user, Password: pass}, tlsCfg, nil
	case "scram-sha-256":
		mech, err := scram.Mechanism(scram.SHA256, user, pass)
		return mech, tlsCfg, err
	case "scram-sha-512":
		mech, err := scram.Mechanism(scram.SHA512, user, pass)
		return mech, tlsCfg, err
	default:
		return nil, nil, fmt.Errorf("unsupported KAFKA_SASL_MECHANISM %q", m)
	}
}

func newReader(broker string) (*kafka.Reader, error) {
	mech, tlsCfg, err := kafkaSecurity()
	if err != nil {
		return nil, err
	}
	return kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{broker}, GroupID: groupID, Topic: topic,
		MinBytes: 1, MaxBytes: 1 << 20, StartOffset: kafka.FirstOffset,
		Dialer: &kafka.Dialer{Timeout: 10 * time.Second, DualStack: true, SASLMechanism: mech, TLS: tlsCfg},
	}), nil
}

func newDLQWriter(broker string) (*kafka.Writer, error) {
	mech, tlsCfg, err := kafkaSecurity()
	if err != nil {
		return nil, err
	}
	return &kafka.Writer{
		Addr: kafka.TCP(broker), Topic: dlqTopic, AllowAutoTopicCreation: true,
		Transport: &kafka.Transport{SASL: mech, TLS: tlsCfg},
	}, nil
}
