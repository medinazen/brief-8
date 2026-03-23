import client from "../../../database/client";

export const create = async (
  title: string,
  list_id: number,
  position: number,
) => {
  const [result] = await client.query(
    "INSERT INTO card (title, list_id, position) VALUES (?, ?, ?)",
    [title, list_id, position],
  );
  return result;
};

export const update = async (id: number, list_id: number, position: number) => {
  await client.query("UPDATE card SET list_id = ?, position = ? WHERE id = ?", [
    list_id,
    position,
    id,
  ]);
};

export const getByList = async (list_id: number) => {
  const [rows] = await client.query(
    "SELECT * FROM card WHERE list_id = ? ORDER BY position",
    [list_id],
  );
  return rows;
};
