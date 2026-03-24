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
        return { ...list, cards: cards.sort((a, b) => a.position - b.position) };
      }),
    );
    setLists(listsWithCards.sort((a, b) => a.position - b.position));
  }, [board.id]);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const getNextPositionForList = () =>
    lists.length === 0 ? 1000 : Math.max(...lists.map((l) => l.position)) + 1000;

  const getNextPositionForCards = (listId: number) => {
    const target = lists.find((l) => l.id === listId);
    if (!target?.cards?.length) return 1000;
    return Math.max(...target.cards.map((c) => c.position || 0)) + 1000;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (!active.id.toString().startsWith("card-")) return;

    const cardId = Number(active.id.toString().replace("card-", ""));
    const overId = over.id.toString();
    let targetListId: number | null = null;

    if (overId.startsWith("list-")) {
      targetListId = Number(overId.replace("list-", ""));
    } else if (overId.startsWith("card-")) {
      const overCardId = Number(overId.replace("card-", ""));
      targetListId = lists.find((l) => l.cards?.some((c) => c.id === overCardId))?.id ?? null;
    }

    if (!targetListId) return;
    await api.put(`/cards/${cardId}`, { list_id: targetListId, position: getNextPositionForCards(targetListId) });
    await fetchLists();
  };

  const addList = async () => {
    const title = prompt("Nom de la liste ?");
    if (!title) return;
    await api.post("/lists", { title, board_id: board.id, position: getNextPositionForList() });
    await fetchLists();
  };

  const addCard = async (listId: number) => {
    const title = prompt("Nom de la carte ?");
    if (!title) return;
    await api.post("/cards", { title, list_id: listId, position: getNextPositionForCards(listId) });
    await fetchLists();
  };

  const updateCard = async (cardId: number, title: string) => {
    await api.put(`/cards/${cardId}`, { title });
    await fetchLists();
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="board-view">
        {lists.map((list) => (
          <ListColumn key={list.id} list={list} onAddCard={addCard} onCardUpdate={updateCard} />
        ))}
        <button type="button" onClick={addList} className="btn-add-list">
          <span className="plus-icon">+</span>
          <span>Ajouter une liste</span>
        </button>
      </div>
    </DndContext>
  );
}