import { afterEach, describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  createListController,
  getListsByBoardController,
} from "../../src/modules/list/listController";
import * as ListModel from "../../src/modules/list/listModel";
jest.mock("../../src/modules/list/listModel");

type ListRow = RowDataPacket & {
  id: number;
  title: string;
  board_id: number;
  position: number;
};

const mockedCreateList = jest.mocked(ListModel.createList);
const mockedGetListsByBoard = jest.mocked(ListModel.getListsByBoard);

const mockResponse = () => {
  //la réponse que l'on vas donner pour éviter les erreurs de type "server" (500)
  const res = {} as Response;
  res.status = jest.fn<(code: number) => Response>().mockReturnValue(res);
  res.json = jest.fn<(data: unknown) => Response>().mockReturnValue(res);
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("listController - createListController()", () => {
  it("doit creer une liste et retourner 201 avec le resultat", async () => {
    const fakeResult = { insertId: 10, affectedRows: 1 } as ResultSetHeader;
    mockedCreateList.mockResolvedValueOnce(fakeResult);

    const req = {
      body: { title: "Todo", board_id: 3, position: 1000 },
    } as Request;
    const res = mockResponse();

    await createListController(req, res);

    expect(mockedCreateList).toHaveBeenCalledWith("Todo", 3, 1000);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });
});

describe("listController - getListsByBoardController()", () => {
  it("doit retourner les listes d'un board avec status 200", async () => {
    const fakeLists: ListRow[] = [
      {
        id: 1,
        title: "Todo",
        board_id: 3,
        position: 0,
      } as ListRow,
      {
        id: 2,
        title: "En cours",
        board_id: 3,
        position: 1000,
      } as ListRow,
    ];
    mockedGetListsByBoard.mockResolvedValueOnce(fakeLists as RowDataPacket[]);

    const req = {
      params: { boardId: "3" },
    } as unknown as Request;
    const res = mockResponse();

    await getListsByBoardController(req, res);

    expect(mockedGetListsByBoard).toHaveBeenCalledWith(3);
    expect(res.json).toHaveBeenCalledWith(fakeLists);
  });

  it("doit retourner un tableau vide si le board n'a aucunes liste", async () => {
    mockedGetListsByBoard.mockResolvedValueOnce([] as RowDataPacket[]);

    const req = {
      params: { boardId: "99" },
    } as unknown as Request;
    const res = mockResponse();

    await getListsByBoardController(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("doit convertir le boardId en nombre avant d'apeller le model", async () => {
    mockedGetListsByBoard.mockResolvedValueOnce([] as RowDataPacket[]);

    const req = {
      params: { boardId: "7" },
    } as unknown as Request;
    const res = mockResponse();

    await getListsByBoardController(req, res);

    expect(mockedGetListsByBoard).toHaveBeenCalledWith(7);
    expect(typeof mockedGetListsByBoard.mock.calls[0][0]).toBe("number");
  });
});
