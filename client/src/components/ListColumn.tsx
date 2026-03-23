import { useDroppable } from "@dnd-kit/core";
import type { Card, List } from "../types/vite-env";
import CardItem from "./card";

type ListColumnProps = {
  list: List;
  onAddCard: (listId: number) => Promise<void>;
  onCardUpdate: (cardId: number, title: string) => Promise<void>;
};

export default function ListColumn({
  list,
  onAddCard,
  onCardUpdate,
}: ListColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `list-${list.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-gradient-to-b from-slate-800 to-slate-900 p-4 w-72 rounded-2xl shadow-xl 
        flex flex-col border-2 border-slate-700 hover:border-slate-600
        transition-all duration-200 min-h-96
        ${isOver ? "ring-2 ring-blue-400 bg-slate-800/50" : ""}
      `}
    >
      <div className="mb-4">
        <h3 className="text-white font-bold text-lg truncate">{list.title}</h3>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-transparent rounded-full mt-1" />
      </div>

      <div className="flex-grow space-y-2 overflow-y-auto pr-2">
        {list.cards?.map((card: Card) => (
          <CardItem key={card.id} card={card} onUpdate={onCardUpdate} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddCard(list.id)}
        className="
          mt-4 w-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white
          rounded-lg px-3 py-2 transition-all duration-200 text-sm font-medium
          border border-slate-600 hover:border-blue-500
          flex items-center justify-center gap-2
        "
      >
        <span>➕</span> Ajouter une carte
      </button>
    </div>
  );
}
