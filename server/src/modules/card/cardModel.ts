import client from "../../../database/client";

export const create = async (
  title: string,
  list_id: number,
  position: number,
  description = "",
) => {
  const [result] = await client.query(
    "INSERT INTO card (title, list_id, position, description) VALUES (?, ?, ?, ?)",
    [title, list_id, position, description],
  );
  return result;
};

export const update = async (
  id: number,
  card: {
    title?: string;
    description?: string;
    list_id?: number;
    position?: number;
  },
) => {
  const setters: string[] = [];
  const values: (string | number)[] = [];

  if (card.title !== undefined) {
    setters.push("title = ?");
    values.push(card.title);
  }
  if (card.description !== undefined) {
    setters.push("description = ?");
    values.push(card.description);
  }
  if (card.list_id !== undefined) {
    setters.push("list_id = ?");
    values.push(card.list_id);
  }
  if (card.position !== undefined) {
    setters.push("position = ?");
    values.push(card.position);
  }

  if (setters.length === 0) {
    return;
  }

  values.push(id);

  await client.query(
    `UPDATE card SET ${setters.join(", ")} WHERE id = ?`,
    values,
  );
};

export const getByList = async (list_id: number) => {
  const [rows] = await client.query(
    "SELECT * FROM card WHERE list_id = ? ORDER BY position",
    [list_id],
  );
  return rows;
};
