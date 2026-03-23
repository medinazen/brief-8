import db from "../../../database/client.ts";

import type { IUser } from "./userController.ts";

export const getAll = async () => {
  const [rows] = await db.query("SELECT * FROM user");
  return rows;
};

export const getUserByEmail = async (email: string) => {
  const [rows] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
  return rows;
};

export const createUser = async (user: IUser) => {
  const [result] = await db.query(
    "INSERT INTO user (firstname, lastname, email, password) VALUES (?,?,?,?)",
    [user.firstname, user.lastname, user.email, user.password],
  );
  return result;
};
