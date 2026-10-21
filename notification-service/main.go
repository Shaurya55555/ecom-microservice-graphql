package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/segmentio/kafka-go"
)

const (
	topic      = "order-events"
	dlqTopic   = "order-events-dlq"
	groupID    = "notification-service"
	maxRetries = 5
)

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

// logEvent writes one JSON line per event.
func logEvent(fields map[string]any) {
	fields["ts"] = time.Now().UTC().Format(time.RFC3339)
	b, _ := json.Marshal(fields)
	os.Stdout.Write(append(b, '\n'))
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	broker := env("KAFKA_BROKER", "localhost:9092")
	store, err := connectWithRetry(ctx, env("MONGO_URI", "mongodb://localhost:27017/notification-service"))
	if err != nil {
		log.Fatalf("mongo: %v", err)
	}
	h := &Handler{Store: store, Now: time.Now}

	srv := &http.Server{Addr: ":" + env("PORT", "3004"), Handler: newMux(store)}
	go func() {
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatalf("http: %v", err)
		}
	}()

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{broker}, GroupID: groupID, Topic: topic,
		MinBytes: 1, MaxBytes: 1 << 20, StartOffset: kafka.FirstOffset,
	})
	dlq := &kafka.Writer{Addr: kafka.TCP(broker), Topic: dlqTopic, AllowAutoTopicCreation: true}

	runConsumer(ctx, reader, dlq, h)

	// The consumer loop has returned, so the in-flight message was committed.
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(shutdownCtx)
	reader.Close()
	dlq.Close()
	logEvent(map[string]any{"msg": "shutdown complete"})
}

func connectWithRetry(ctx context.Context, uri string) (*MongoStore, error) {
	var err error
	for i := 0; i < 10; i++ {
		var s *MongoStore
		c, cancel := context.WithTimeout(ctx, 5*time.Second)
		s, err = NewMongoStore(c, uri)
		cancel()
		if err == nil {
			return s, nil
		}
		time.Sleep(2 * time.Second)
	}
	return nil, err
}

// runConsumer fetches, handles, then commits. The commit happens only after
// the message was stored or parked in the DLQ, so nothing is dropped. On
// shutdown the loop finishes the message it holds before returning.
func runConsumer(ctx context.Context, r *kafka.Reader, dlq *kafka.Writer, h *Handler) {
	for {
		msg, err := r.FetchMessage(ctx)
		if err != nil {
			if ctx.Err() != nil || errors.Is(err, io.EOF) {
				return // shutdown requested or reader closed
			}
			// Broker unavailable or rebalancing: keep the service alive and retry.
			logEvent(map[string]any{"msg": "fetch failed, retrying", "error": err.Error()})
			time.Sleep(time.Second)
			continue
		}
		process(h, dlq, msg)
		if err := r.CommitMessages(context.Background(), msg); err != nil {
			logEvent(map[string]any{"msg": "commit failed", "error": err.Error()})
		}
	}
}

type dlqWriter interface {
	WriteMessages(ctx context.Context, msgs ...kafka.Message) error
}

var initialBackoff = 200 * time.Millisecond

func process(h *Handler, dlq dlqWriter, msg kafka.Message) {
	// Detached from the shutdown context so an in-flight message finishes.
	ctx := context.Background()
	backoff := initialBackoff
	var lastErr error
	for attempt := 1; attempt <= maxRetries; attempt++ {
		evType, orderID, err := h.Handle(ctx, msg.Value)
		if err == nil {
			logEvent(map[string]any{"msg": "processed", "type": evType, "orderId": orderID, "offset": msg.Offset})
			return
		}
		lastErr = err
		if errors.Is(err, ErrPoison) {
			break
		}
		logEvent(map[string]any{"msg": "retry", "type": evType, "orderId": orderID, "attempt": attempt, "error": err.Error()})
		time.Sleep(backoff)
		backoff *= 2
	}
	// Keep trying the DLQ: committing before it lands would lose the message.
	for {
		err := dlq.WriteMessages(ctx, kafka.Message{
			Key: msg.Key, Value: msg.Value,
			Headers: []kafka.Header{{Key: "error", Value: []byte(lastErr.Error())}},
		})
		if err == nil {
			break
		}
		logEvent(map[string]any{"msg": "dlq write failed", "error": err.Error()})
		time.Sleep(time.Second)
	}
	logEvent(map[string]any{"msg": "sent to dlq", "topic": dlqTopic, "error": lastErr.Error()})
}
