import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/fetchapi";
import type { Board, Card, List } from "../types/vite-env";
import ListColumn from "./ListColumn";

export default function BoardView({ board }: { board: Board }) {
  const [lists, setLists] = useState<List[]>([]);

  const fetchLists = useCallback(async () => {
    const listsData = await api.get<List[]>(`/lists/${board.id}`);

    const listsWithCards = await Promise.all(
      listsData.map(async (list) => {
        const cards = await api.get<Card[]>(`/cards/${list.id}`);
        const sortedCards = cards.sort((a, b) => a.position - b.position);
        return { ...list, cards: sortedCards };
      }),
    );

    const sortedLists = listsWithCards.sort((a, b) => a.position - b.position);
    setLists(sortedLists);
  }, [board.id]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const getNextPositionForList = () => {
    if (lists.length === 0) return 1000;
    return Math.max(...lists.map((list) => list.position)) + 1000;
  };

  const getNextPositionForCards = (listId: number) => {
    const targetList = lists.find((list) => list.id === listId);
    if (!targetList || !targetList.cards || targetList.cards.length === 0) {
      return Date.now();
    }
    return Math.max(...targetList.cards.map((card) => card.position || 0)) + 1;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    if (!active.id.toString().startsWith("card-")) return;

    const cardId = Number(active.id.toString().replace("card-", ""));

    let targetListId: number | null = null;
    const overId = over.id.toString();

    if (overId.startsWith("list-")) {
      targetListId = Number(overId.replace("list-", ""));
    } else if (overId.startsWith("card-")) {
      const overCardId = Number(overId.replace("card-", ""));
      const listWithCard = lists.find((list) =>
        list.cards?.some((card) => card.id === overCardId),
      );
      targetListId = listWithCard?.id ?? null;
    }

    if (!targetListId) return;

    const nextPosition = getNextPositionForCards(targetListId);

    await api.put(`/cards/${cardId}`, {
      list_id: targetListId,
      position: nextPosition,
    });

    await fetchLists();
  };

  const addList = async () => {
    const title = prompt("Nom de la liste ?");
    if (!title) return;

    await api.post("/lists", {
      title,
      board_id: board.id,
      position: getNextPositionForList(),
    });

    await fetchLists();
  };

  const addCard = async (listId: number) => {
    const title = prompt("Nom de la carte ?");
    if (!title) return;

    await api.post("/cards", {
      title,
      list_id: listId,
      position: getNextPositionForCards(listId),
    });

    await fetchLists();
  };

  const updateCard = async (cardId: number, title: string) => {
    await api.put(`/cards/${cardId}`, { title });
    await fetchLists();
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 p-6 overflow-x-auto pb-8">
        {lists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            onAddCard={addCard}
            onCardUpdate={updateCard}
          />
        ))}

        <button
          type="button"
          onClick={addList}
          className="
            h-96 w-72 bg-gradient-to-b from-slate-700/50 to-slate-800/50 text-slate-400
            rounded-2xl border-2 border-dashed border-slate-600 hover:border-blue-500
            hover:text-blue-400 transition-all duration-200 flex items-center justify-center
            font-semibold text-lg hover:bg-slate-700/50 group
          "
        >
          <div className="flex flex-col items-center gap-2">
            <span className="group-hover:scale-125 transition-transform duration-200">
              ➕
            </span>
            <span>Ajouter une liste</span>
          </div>
        </button>
      </div>
    </DndContext>
  );
}
