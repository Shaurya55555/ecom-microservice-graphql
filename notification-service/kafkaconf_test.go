package main

import "testing"

func TestKafkaSecurity(t *testing.T) {
	tests := []struct {
		name     string
		env      map[string]string
		wantSASL bool
		wantTLS  bool
		wantErr  bool
	}{
		{"local plain", map[string]string{}, false, false, false},
		{"tls only", map[string]string{"KAFKA_TLS": "true"}, false, true, false},
		{"sasl plain implies tls", map[string]string{"KAFKA_SASL_USERNAME": "key", "KAFKA_SASL_PASSWORD": "secret"}, true, true, false},
		{"sasl scram-512", map[string]string{"KAFKA_SASL_USERNAME": "u", "KAFKA_SASL_PASSWORD": "p", "KAFKA_SASL_MECHANISM": "scram-sha-512"}, true, true, false},
		{"unknown mechanism", map[string]string{"KAFKA_SASL_USERNAME": "u", "KAFKA_SASL_MECHANISM": "gssapi"}, false, false, true},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			for _, k := range []string{"KAFKA_TLS", "KAFKA_SASL_USERNAME", "KAFKA_SASL_PASSWORD", "KAFKA_SASL_MECHANISM"} {
				t.Setenv(k, tc.env[k])
			}
			mech, tlsCfg, err := kafkaSecurity()
			if (err != nil) != tc.wantErr {
				t.Fatalf("err = %v, wantErr %v", err, tc.wantErr)
			}
			if (mech != nil) != tc.wantSASL {
				t.Errorf("sasl set = %v, want %v", mech != nil, tc.wantSASL)
			}
			if (tlsCfg != nil) != tc.wantTLS {
				t.Errorf("tls set = %v, want %v", tlsCfg != nil, tc.wantTLS)
			}
		})
	}
}
