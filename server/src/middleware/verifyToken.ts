import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { IUser } from "../modules/user/userController.ts";
import * as UserModel from "../modules/user/userModel.ts";

dotenv.config();

export interface AuthRequest extends Request {
  user?: IUser;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      res.status(401).json({ message: "Action non autorisée" });
      return;
    }

    const tokenDecode = jwt.verify(
      token,
      (process.env.JWT_SECRET as string) ||
        "dgjshdfguykdshgdfkjhgfjdsf0011231141.20231$$",
    ) as { user_id: string; user_email: string; role: string };

    const [userIfExist] = (await UserModel.getUserByEmail(
      tokenDecode.user_email,
    )) as IUser[];
    if (!userIfExist) {
      res.status(401).json({ message: "Action non autorisée" });
      return;
    }

    req.user = userIfExist;
    next();
  } catch (err) {
    res.status(500).json({ message: "Erreur du serveurs" });
  }
};
