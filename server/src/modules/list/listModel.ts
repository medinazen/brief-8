import client from "../../../database/client.ts";

export const createList = async (
  title: string,
  board_id: number,
  position: number
) => {
  const [result] = await client.query(
    "INSERT INTO list (title, board_id, position) VALUES (?, ?, ?)",
    [title, board_id, position]
  );
  return result;
};

export const getListsByBoard = async (board_id: number) => {
  const [rows] = await client.query(
    "SELECT * FROM list WHERE board_id = ? ORDER BY position",
    [board_id]
  );
  return rows;
};