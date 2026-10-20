package main

import (
	"context"
	"errors"
	"testing"
	"time"
)

// fakeStore mimics the unique (orderId, type, status) index.
type fakeStore struct {
	seen map[string]bool
	fail error
	rows []Notification
}

func (f *fakeStore) Insert(_ context.Context, n Notification) (bool, error) {
	if f.fail != nil {
		return false, f.fail
	}
	k := n.OrderID + "|" + n.Type + "|" + n.Status
	if f.seen[k] {
		return false, nil
	}
	f.seen[k] = true
	f.rows = append(f.rows, n)
	return true, nil
}

func (f *fakeStore) ListByUser(context.Context, string) ([]Notification, error) { return f.rows, nil }

func TestHandle(t *testing.T) {
	created := `{"type":"order_created","order":{"_id":"o1","userId":"u1","productId":"p1","quantity":2}}`
	accepted := `{"type":"order_status_changed","orderId":"o1","status":"Accepted","userId":"u1"}`

	tests := []struct {
		name       string
		msgs       []string
		storeErr   error
		wantRows   int
		wantPoison bool
		transient  bool
	}{
		{name: "order created", msgs: []string{created}, wantRows: 1},
		{name: "status changed", msgs: []string{accepted}, wantRows: 1},
		{name: "duplicate delivery stores once", msgs: []string{created, created}, wantRows: 1},
		{name: "bad json", msgs: []string{`{not json`}, wantPoison: true},
		{name: "unknown type", msgs: []string{`{"type":"user_deleted"}`}, wantPoison: true},
		{name: "missing order id", msgs: []string{`{"type":"order_status_changed","status":"Accepted"}`}, wantPoison: true},
		{name: "store failure is transient", msgs: []string{created}, storeErr: errors.New("mongo down"), transient: true},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			s := &fakeStore{seen: map[string]bool{}, fail: tc.storeErr}
			h := &Handler{Store: s, Now: time.Now}
			var err error
			for _, m := range tc.msgs {
				_, _, err = h.Handle(context.Background(), []byte(m))
			}
			switch {
			case tc.wantPoison:
				if !errors.Is(err, ErrPoison) {
					t.Fatalf("want poison error, got %v", err)
				}
			case tc.transient:
				if err == nil || errors.Is(err, ErrPoison) {
					t.Fatalf("want transient error, got %v", err)
				}
			default:
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
			}
			if len(s.rows) != tc.wantRows {
				t.Fatalf("rows = %d, want %d", len(s.rows), tc.wantRows)
			}
		})
	}
}
