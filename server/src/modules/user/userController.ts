import type { ResultSetHeader } from "mysql2";
import * as UserModel from "./userModel.ts";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import type { AuthRequest } from "../../middleware/verifyToken.ts";

export type IUser = {
    id?: number;
    email: string;
    firstname: string;
    lastname: string;
    password: string;
}


export const getAllUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserModel.getAll() as IUser[];
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(`error: ${error}`);
  }
};

export const getOneUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).send(`error: ${error}`);
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body) {
      res.status(404).json();
      return;
    }

    const [user] = await UserModel.getUserByEmail(req.body.email) as IUser[];

    if (user && Object.keys(user).length !== 0) {
      res.status(401).json({ message: "Non autorisé" });
      return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = {
      ...req.body,
      password: hashedPassword
    };

    const result = await UserModel.createUser(newUser) as ResultSetHeader;

    if (result.insertId) {
      res.status(201).json({ message: "Utilisateur créé", result });
    } else {
      res.status(500).json({ message: "Erreur" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).send(`error: ${error}`);
  }
};