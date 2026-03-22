import express from "express";
import { createListController, getListsByBoardController } from "./modules/list/listController";
import * as AuthController from "./modules/auth/authController";
import * as userController from "./modules/user/userController";
import { verifyToken } from "./middleware/verifyToken";
import { createCard, updateCard, getCardsByList } from "./modules/card/CardController";
import { createBoardController, getBoardsController } from "./modules/board/boardController";

const router = express.Router();


router.post("/login", AuthController.login);
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