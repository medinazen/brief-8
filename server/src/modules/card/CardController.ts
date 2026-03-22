import type { Request, Response } from "express";
import * as CardModel from "./cardModel.ts";

export const createCard = async (req: Request, res: Response) => {
  const { title, list_id, position } = req.body;

  const result = await CardModel.create(title, list_id, position || 0);
  res.status(201).json(result);
};

export const updateCard = async (req: Request, res: Response) => {
  const { list_id, position } = req.body;

  await CardModel.update(
    Number(req.params.id),
    list_id,
    position
  );

  res.sendStatus(200);
};

export const getCardsByList = async (req: Request, res: Response) => {
  const cards = await CardModel.getByList(Number(req.params.listId));
  res.json(cards);
};