import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { api } from "../services/fetchapi";
import type { Board, List } from "../types/vite-env";
import ListColumn from "./ListColumn";

export default function BoardView({ board }: { board: Board }) {
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    api.get<List[]>(`/lists/${board.id}`).then(setLists);
  }, [board.id]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const cardId = Number(active.id);
    const newListId = Number(over.id);

    await api.put(`/cards/${cardId}`, {
      list_id: newListId,
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: 20, padding: 20 }}>
        {lists.map((list) => (
          <ListColumn key={list.id} list={list} />
        ))}
      </div>
    </DndContext>
  );
}
