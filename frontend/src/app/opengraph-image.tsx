import { ImageResponse } from "next/og";

export const alt = "Ecom.store - Shop, sell and ship";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#f4eee3",
          color: "#2a211a",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 600,
            color: "#a64b2a",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Microservices marketplace
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 112,
            fontWeight: 700,
            marginTop: 24,
            lineHeight: 1.05,
          }}
        >
          Ecom.store
        </div>
        <div style={{ display: "flex", fontSize: 44, marginTop: 20 }}>
          Shop, sell and ship
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            marginTop: 56,
            color: "#6b5a4b",
          }}
        >
          GraphQL gateway · Kafka · Node.js · Docker · Next.js
        </div>
      </div>
    ),
    { ...size },
  );
}
