import client from "../../../database/client";

export const createBoard = async (title: string, user_id: number) => {
  const [result] = await client.query(
    "INSERT INTO board (title, user_id) VALUES (?, ?)",
    [title, user_id],
  );
  return result;
};

export const getBoards = async (user_id: number, allUsers = false) => {
  if (allUsers) {
    const [rows] = await client.query("SELECT * FROM board");
    return rows;
  }

  const [rows] = await client.query("SELECT * FROM board WHERE user_id = ?", [
    user_id,
  ]);
  return rows;
};
