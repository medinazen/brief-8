import { useDraggable } from "@dnd-kit/core";
import type { Card } from "../types/vite-env";

type CardItemProps = {
  card: Card;
  onUpdate: (cardId: number, title: string) => Promise<void>;
};

export default function CardItem({ card, onUpdate }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${card.id}`,
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
  };

  const handleEdit = async () => {
    const newTitle = prompt("Modifier la carte", card.title);
    if (!newTitle || newTitle === card.title) return;
    await onUpdate(card.id, newTitle);
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onDoubleClick={handleEdit}
      className={`kanban-card${isDragging ? " dragging" : ""}`}
      style={style}
    >
      {card.title}
    </div>
  );
}