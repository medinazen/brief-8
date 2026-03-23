import type { Request, Response } from "express";
import * as ListModel from "./listModel";

export const createListController = async (req: Request, res: Response) => {
  const { title, board_id, position } = req.body;

  const result = await ListModel.createList(title, board_id, position || 0);

  res.status(201).json(result);
};

export const getListsByBoardController = async (
  req: Request,
  res: Response,
) => {
  const lists = await ListModel.getListsByBoard(Number(req.params.boardId));

  res.json(lists);
};
