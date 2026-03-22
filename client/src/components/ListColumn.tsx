import { useEffect, useState } from "react";
import { api } from "../services/fetchapi";
import type { List, Card } from "../types/vite-env";
import CardItem from "./card";

export default function ListColumn({ list }: { list: List }) {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    api.get<Card[]>(`/cards/${list.id}`).then(setCards);
  }, [list.id]);

  const addCard = async () => {
    const res = await api.post<{ insertId: number }>("/cards", {
      title: "Nouvelle tâche",
      list_id: list.id,
    });

    const newCard: Card = {
      id: res.insertId,
      title: "Nouvelle tâche",
      list_id: list.id,
      position: Date.now(),
    };

    setCards((prev) => [...prev, newCard]);
  };

  return (
    <div
      style={{
        background: "#eee",
        padding: 10,
        width: 250,
        borderRadius: 8,
      }}
    >
      <h3>{list.title}</h3>

      {cards.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}

      <button type="button" onClick={addCard}>
        + Ajouter
      </button>
    </div>
  );
}