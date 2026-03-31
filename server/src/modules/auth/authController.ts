import bcrypt from "bcrypt";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { IUser } from "../user/userController.ts";
import * as UserModel from "../user/userModel.ts";

dotenv.config();

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email et mot de passe requis" });
      return;
    }

    const users = (await UserModel.getUserByEmail(email)) as IUser[];
    const userIfExist = users[0];

    if (!userIfExist) {
      res.status(401).json({ message: "Identifiants invalides" });
      return;
    }

    const isValidPassword = await bcrypt.compare(
      password,
      userIfExist.password,
    );

    if (!isValidPassword) {
      res.status(401).json({ message: "Identifiants invalides" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "Configuration serveur manquante" });
      return;
    }

    const token = jwt.sign(
      {
        user_id: userIfExist.id,
        user_email: userIfExist.email,
        role: "user",
      },
      secret,
      { expiresIn: "30d" },
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    });

    res.status(200).json({ message: "Connexion réussie" });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
