import express from "express";
import { verifyToken } from "./middleware/verifyToken";
import * as AuthController from "./modules/auth/authController";
import {
  createBoardController,
  getBoardsController,
} from "./modules/board/boardController";
import {
  createCard,
  getCardsByList,
  updateCard,
} from "./modules/card/CardController";
import {
  createListController,
  getListsByBoardController,
} from "./modules/list/listController";
import * as userController from "./modules/user/userController";

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.status(200).json({ message: "Deconnexion effectuée" });
});
router.post("/createUser", userController.create);

router.get("/getUser", verifyToken, userController.getOneUser);
router.get("/getAll", userController.getAllUser);

router.post("/boards", verifyToken, createBoardController);
router.get("/boards", verifyToken, getBoardsController);

router.post("/lists", verifyToken, createListController);
router.get("/lists/:boardId", verifyToken, getListsByBoardController);

router.post("/cards", verifyToken, createCard);
router.put("/cards/:id", verifyToken, updateCard);
router.get("/cards/:listId", verifyToken, getCardsByList);

export default router;
