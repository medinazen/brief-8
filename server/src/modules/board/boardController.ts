import type { Response } from "express";
import type { AuthRequest } from "../../middleware/verifyToken";
import * as BoardModel from "./boardModel";

export const createBoardController = async (
  req: AuthRequest,
  res: Response,
) => {
  if (!req.user || req.user.id === undefined) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { title } = req.body;

  const result = await BoardModel.createBoard(title, req.user.id);

  res.status(201).json(result);
};

export const getBoardsController = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.id === undefined) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const boards = await BoardModel.getBoards(req.user.id);
  res.json(boards);
};
