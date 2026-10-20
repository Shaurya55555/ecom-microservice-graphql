package main

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/segmentio/kafka-go"
)

type countingStore struct {
	calls     int
	failFirst int // number of leading Insert calls that fail
}

func (c *countingStore) Insert(context.Context, Notification) (bool, error) {
	c.calls++
	if c.calls <= c.failFirst {
		return false, errors.New("mongo down")
	}
	return true, nil
}
func (c *countingStore) ListByUser(context.Context, string) ([]Notification, error) { return nil, nil }

type fakeDLQ struct{ msgs []kafka.Message }

func (f *fakeDLQ) WriteMessages(_ context.Context, m ...kafka.Message) error {
	f.msgs = append(f.msgs, m...)
	return nil
}

func TestProcessRetryAndDLQ(t *testing.T) {
	initialBackoff = time.Millisecond
	good := []byte(`{"type":"order_created","order":{"_id":"o1","userId":"u1","productId":"p1"}}`)

	tests := []struct {
		name      string
		value     []byte
		failFirst int
		wantCalls int
		wantDLQ   int
	}{
		{"recovers after transient failures", good, 2, 3, 0},
		{"exhausts retries then DLQ", good, 100, maxRetries, 1},
		{"poison goes to DLQ without retry", []byte(`{bad`), 0, 0, 1},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			s := &countingStore{failFirst: tc.failFirst}
			d := &fakeDLQ{}
			process(&Handler{Store: s, Now: time.Now}, d, kafka.Message{Value: tc.value})
			if s.calls != tc.wantCalls {
				t.Errorf("store calls = %d, want %d", s.calls, tc.wantCalls)
			}
			if len(d.msgs) != tc.wantDLQ {
				t.Errorf("dlq msgs = %d, want %d", len(d.msgs), tc.wantDLQ)
			}
		})
	}
}
