import { useDroppable } from "@dnd-kit/core";
import type { Card, List } from "../types/vite-env";
import CardItem from "./card";

type ListColumnProps = {
  list: List;
  onAddCard: (listId: number) => Promise<void>;
  onCardUpdate: (cardId: number, title: string) => Promise<void>;
};

export default function ListColumn({ list, onAddCard, onCardUpdate }: ListColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `list-${list.id}` });

  return (
    <div ref={setNodeRef} className={`list-column${isOver ? " drag-over" : ""}`}>
      <div className="list-header">
        <h3 className="list-title">{list.title}</h3>
        <div className="list-accent-bar" />
      </div>

      <div className="list-cards">
        {list.cards?.map((card: Card) => (
          <CardItem key={card.id} card={card} onUpdate={onCardUpdate} />
        ))}
      </div>

      <button type="button" onClick={() => onAddCard(list.id)} className="btn-add-card">
        <span>＋</span>
        <span>Ajouter une carte</span>
      </button>
    </div>
  );
}