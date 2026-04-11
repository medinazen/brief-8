import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import type { Card, List } from "../types/vite-env";
import CardItem from "./card";

type ListColumnProps = {
  list: List;
  onAddCard: (listId: number, title: string) => Promise<void>;
  onCardUpdate: (cardId: number, title: string) => Promise<void>;
};

export default function ListColumn({
  list,
  onAddCard,
  onCardUpdate,
}: ListColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `list-${list.id}` });
  const [newCardTitle, setNewCardTitle] = useState("");
  const [showCardInput, setShowCardInput] = useState(false);

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    await onAddCard(list.id, newCardTitle.trim());
    setNewCardTitle("");
    setShowCardInput(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`list-column${isOver ? " drag-over" : ""}`}
    >
      <div className="list-header">
        <h3 className="list-title">{list.title}</h3>
        <div className="list-accent-bar" />
      </div>

      <div className="list-cards">
        {list.cards?.map((card: Card) => (
          <CardItem key={card.id} card={card} onUpdate={onCardUpdate} />
        ))}
      </div>

      {showCardInput ? (
        <div className="add-card-form">
          <input
            type="text"
            className="add-card-input"
            placeholder="Nom de la carte"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCard()}
          />
          <div className="add-card-actions">
            <button
              type="button"
              onClick={handleAddCard}
              className="btn-confirm"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCardInput(false);
                setNewCardTitle("");
              }}
              className="btn-cancel"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCardInput(true)}
          className="btn-add-card"
        >
          <span>＋</span>
          <span>Ajouter une carte</span>
        </button>
      )}
    </div>
  );
}
