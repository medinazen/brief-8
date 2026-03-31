import type { Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { AuthRequest } from "../../src/middleware/verifyToken";
import {
  createBoardController,
  getBoardsController,
} from "../../src/modules/board/boardController";
import * as BoardModel from "../../src/modules/board/boardModel";

jest.mock("../../src/modules/board/boardModel");

type BoardRow = RowDataPacket & {
  id: number;
  title: string;
  user_id: number;
};

const mockedCreateBoard = jest.mocked(BoardModel.createBoard);
const mockedGetBoards = jest.mocked(BoardModel.getBoards);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("boardController - createBoardController()", () => {
  it("doit retourner 401 si aucun utilisateur dans la requete", async () => {
    const req = {
      user: undefined,
      body: { title: "Mon board" },
    } as AuthRequest;
    const res = mockResponse();

    await createBoardController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("doit retourner 401 si user.id est undefind", async () => {
    const req = {
      user: { email: "a@a.com", firstname: "A", lastname: "B", password: "h" },
      body: { title: "Board test" },
    } as AuthRequest;
    const res = mockResponse();

    await createBoardController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("doit créer un board et retourner 201 avec le résultat", async () => {
    const fakeResult = { insertId: 5, affectedRows: 1 } as ResultSetHeader;
    mockedCreateBoard.mockResolvedValueOnce(fakeResult);

    const req = {
      user: {
        id: 1,
        email: "a@a.com",
        firstname: "A",
        lastname: "B",
        password: "h",
      },
      body: { title: "Mon super board" },
    } as AuthRequest;
    const res = mockResponse();

    await createBoardController(req, res);

    expect(mockedCreateBoard).toHaveBeenCalledWith("Mon super board", 1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });
});

describe("boardController - getBoardsController()", () => {
  it("doit retourner 401 si user est abssent de la requête", async () => {
    const req = { user: undefined, query: {} } as AuthRequest;
    const res = mockResponse();

    await getBoardsController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("doit retourner les boards de l'utilisateur connecté", async () => {
    const fakeBoards: BoardRow[] = [
      {
        id: 1,
        title: "Board A",
        user_id: 1,
        constructor: { name: "RowDataPacket" },
      } as BoardRow,
      {
        id: 2,
        title: "Board B",
        user_id: 1,
        constructor: { name: "RowDataPacket" },
      } as BoardRow,
    ];
    mockedGetBoards.mockResolvedValueOnce(fakeBoards as RowDataPacket[]);

    const req = {
      user: {
        id: 1,
        email: "a@a.com",
        firstname: "A",
        lastname: "B",
        password: "h",
      },
      query: {},
    } as AuthRequest;
    const res = mockResponse();

    await getBoardsController(req, res);

    expect(mockedGetBoards).toHaveBeenCalledWith(1, false);
    expect(res.json).toHaveBeenCalledWith(fakeBoards);
  });

  it("doit passer allUsers=true si le query param 'all' vaut 'true'", async () => {
    mockedGetBoards.mockResolvedValueOnce([] as RowDataPacket[]);

    const req = {
      user: {
        id: 2,
        email: "b@b.com",
        firstname: "B",
        lastname: "C",
        password: "h",
      },
      query: { all: "true" },
    } as unknown as AuthRequest;
    const res = mockResponse();

    await getBoardsController(req, res);

    expect(mockedGetBoards).toHaveBeenCalledWith(2, true);
  });
});
