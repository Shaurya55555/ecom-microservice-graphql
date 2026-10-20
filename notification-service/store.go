package main

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type MongoStore struct{ coll *mongo.Collection }

func NewMongoStore(ctx context.Context, uri string) (*MongoStore, error) {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}
	coll := client.Database("notification-service").Collection("notifications")
	_, err = coll.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "orderId", Value: 1}, {Key: "type", Value: 1}, {Key: "status", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{Keys: bson.D{{Key: "userId", Value: 1}, {Key: "createdAt", Value: -1}}},
	})
	if err != nil {
		return nil, err
	}
	return &MongoStore{coll: coll}, nil
}

func (s *MongoStore) Insert(ctx context.Context, n Notification) (bool, error) {
	_, err := s.coll.InsertOne(ctx, n)
	if mongo.IsDuplicateKeyError(err) {
		return false, nil
	}
	return err == nil, err
}

func (s *MongoStore) ListByUser(ctx context.Context, userID string) ([]Notification, error) {
	cur, err := s.coll.Find(ctx, bson.M{"userId": userID},
		options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(100))
	if err != nil {
		return nil, err
	}
	out := []Notification{}
	if err := cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *MongoStore) Ping(ctx context.Context) error {
	return s.coll.Database().Client().Ping(ctx, readpref.Primary())
}
