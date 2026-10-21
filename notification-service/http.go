package main

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

type pinger interface {
	Store
	Ping(ctx context.Context) error
}

func newMux(s pinger) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := s.Ping(ctx); err != nil {
			http.Error(w, `{"status":"mongo unavailable"}`, http.StatusServiceUnavailable)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})
	mux.HandleFunc("/notifications", func(w http.ResponseWriter, r *http.Request) {
		uid := r.URL.Query().Get("userId")
		if uid == "" {
			http.Error(w, `{"message":"userId is required"}`, http.StatusBadRequest)
			return
		}
		list, err := s.ListByUser(r.Context(), uid)
		if err != nil {
			http.Error(w, `{"message":"query failed"}`, http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(list)
	})
	return mux
}
