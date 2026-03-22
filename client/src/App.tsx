import { useEffect, useState } from "react";
import { api } from "./services/fetchapi";
import type { Board } from "./types/vite-env";
import BoardView from "./components/BoardView";

export default function App() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
useEffect(() => {
  const login = async () => {
    await api.post("/login", {
      email: "test@test.com",
      password: "1234",
    });
  };

  login();
}, []);
  useEffect(() => {
    api.get<Board[]>("/boards").then((data) => {
      setBoards(data);
      setSelectedBoard(data[0]); 
    });
  }, []);

  if (!selectedBoard) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={{ padding: 10 }}>Trello Clone</h1>


      <div style={{ display: "flex", gap: 10, padding: 10 }}>
        {boards.map((b) => (
          <button type = "button"key={b.id} onClick={() => setSelectedBoard(b)}>
            {b.title}
          </button>
        ))}
      </div>

      <BoardView board={selectedBoard} />
    </div>
  );
}
    