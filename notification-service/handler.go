package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

// Notification is the stored record. (OrderID, Type, Status) is unique, so a
// redelivered event cannot create a second notification.
type Notification struct {
	OrderID   string    `bson:"orderId" json:"orderId"`
	UserID    string    `bson:"userId" json:"userId"`
	Type      string    `bson:"type" json:"type"`
	Status    string    `bson:"status" json:"status"`
	Message   string    `bson:"message" json:"message"`
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
}

// Store persists notifications. Insert must return inserted=false, err=nil
// when the (orderId, type, status) key already exists.
type Store interface {
	Insert(ctx context.Context, n Notification) (inserted bool, err error)
	ListByUser(ctx context.Context, userID string) ([]Notification, error)
}

type orderEvent struct {
	Type    string `json:"type"`
	OrderID string `json:"orderId"`
	UserID  string `json:"userId"`
	Status  string `json:"status"`
	Order   *struct {
		ID        string `json:"_id"`
		UserID    string `json:"userId"`
		ProductID string `json:"productId"`
		Status    string `json:"status"`
	} `json:"order"`
}

// ErrPoison marks a message that can never succeed (bad JSON, unknown type,
// missing fields). The consumer sends these to the DLQ without retrying.
var ErrPoison = errors.New("poison message")

type Handler struct {
	Store Store
	Now   func() time.Time
}

// Handle processes one event. It returns nil on success or duplicate,
// ErrPoison (wrapped) for permanently bad input, and any other error for
// transient failures that should be retried.
func (h *Handler) Handle(ctx context.Context, raw []byte) (eventType, orderID string, err error) {
	var ev orderEvent
	if err := json.Unmarshal(raw, &ev); err != nil {
		return "", "", fmt.Errorf("%w: invalid json: %v", ErrPoison, err)
	}

	var n Notification
	switch ev.Type {
	case "order_created":
		if ev.Order == nil || ev.Order.ID == "" {
			return ev.Type, "", fmt.Errorf("%w: order_created without order._id", ErrPoison)
		}
		n = Notification{
			OrderID: ev.Order.ID,
			UserID:  ev.Order.UserID,
			Type:    ev.Type,
			Status:  "Pending",
			Message: fmt.Sprintf("New order for product %s", ev.Order.ProductID),
		}
	case "order_status_changed":
		if ev.OrderID == "" || ev.Status == "" {
			return ev.Type, ev.OrderID, fmt.Errorf("%w: order_status_changed without orderId/status", ErrPoison)
		}
		n = Notification{
			OrderID: ev.OrderID,
			UserID:  ev.UserID,
			Type:    ev.Type,
			Status:  ev.Status,
			Message: fmt.Sprintf("Your order was %s", ev.Status),
		}
	default:
		return ev.Type, "", fmt.Errorf("%w: unknown type %q", ErrPoison, ev.Type)
	}

	n.CreatedAt = h.Now()
	if _, err := h.Store.Insert(ctx, n); err != nil {
		return ev.Type, n.OrderID, err
	}
	return ev.Type, n.OrderID, nil
}
