import type { Card } from "../types/vite-env";

export default function CardItem({ card }: { card: Card }) {
  return (
    <div
      style={{
        background: "white",
        padding: 8,
        marginBottom: 8,
        borderRadius: 6,
      }}
    >
      {card.title}
    </div>
  );
}