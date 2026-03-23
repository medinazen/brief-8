import bcrypt from "bcrypt";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { IUser } from "../user/userController.ts";
import * as UserModel from "../user/userModel.ts";

dotenv.config();

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("BODY:", req.body);

    const { email, password } = req.body;

    const users = (await UserModel.getUserByEmail(email)) as IUser[];
    console.log("DB RESULT:", users);

    const userIfExist = users[0];

    if (!userIfExist) {
      res.status(401).json({ message: "Credential not valid" });
      return;
    }

    console.log("HASH IN DB:", userIfExist.password);

    const isValidePassword = await bcrypt.compare(
      password,
      userIfExist.password,
    );
    console.log("PASSWORD VALID:", isValidePassword);

    const generateToken = jwt.sign(
      {
        user_id: userIfExist.id,
        user_email: userIfExist.email,
        role: "user",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" },
    );

    console.log("TOKEN CREATED");

    res.cookie("access_token", generateToken);

    res.status(200).json({
      message: "Connexion réussie",
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "erreur serveur" });
  }
};
