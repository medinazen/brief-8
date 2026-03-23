import { useDraggable } from "@dnd-kit/core";
import type { Card } from "../types/vite-env";

type CardItemProps = {
  card: Card;
  onUpdate: (cardId: number, title: string) => Promise<void>;
};

export default function CardItem({ card, onUpdate }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `card-${card.id}`,
    });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
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
      className={`
        bg-gradient-to-br from-slate-700 to-slate-800 text-white p-3 mb-2 rounded-lg
        shadow-md hover:shadow-xl cursor-grab active:cursor-grabbing
        border border-slate-600 hover:border-blue-500
        transition-all duration-200 transform hover:scale-105
        ${isDragging ? "opacity-50 ring-2 ring-blue-400" : ""}
      `}
      style={style}
    >
      <p className="text-sm leading-relaxed font-medium">{card.title}</p>
    </div>
  );
}
