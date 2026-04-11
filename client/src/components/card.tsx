import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import type { Card } from "../types/vite-env";

type CardItemProps = {
  card: Card;
  onUpdate: (cardId: number, title: string) => Promise<void>;
};

export default function CardItem({ card, onUpdate }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `card-${card.id}` });

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  const handleSave = async () => {
    if (!editTitle.trim() || editTitle === card.title) {
      setEditing(false);
      setEditTitle(card.title);
      return;
    }
    await onUpdate(card.id, editTitle.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="kanban-card-edit">
        <input
          type="text"
          className="card-edit-input"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setEditing(false);
              setEditTitle(card.title);
            }
          }}
        />
        <div className="card-edit-actions">
          <button type="button" onClick={handleSave} className="btn-confirm">
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setEditTitle(card.title);
            }}
            className="btn-cancel"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onDoubleClick={() => setEditing(true)}
      className={`kanban-card${isDragging ? " dragging" : ""}`}
      style={style}
    >
      {card.title}
    </div>
  );
}
