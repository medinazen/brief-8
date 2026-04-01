import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  createCard,
  getCardsByList,
  updateCard,
} from "../../src/modules/card/CardController";
import * as CardModel from "../../src/modules/card/cardModel";

jest.mock("../../../src/modules/card/cardModel");

type CardRow = RowDataPacket & {
  id: number;
  title: string;
  list_id: number;
  position: number;
  description: string;
};

const mockedCreate = jest.mocked(CardModel.create);
const mockedUpdate = jest.mocked(CardModel.update);
const mockedGetByList = jest.mocked(CardModel.getByList);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("cardController - createCard()", () => {
  it("doit créer une carte et retourner 201 avec le résultat", async () => {
    const fakeResult = { insertId: 20, affectedRows: 1 } as ResultSetHeader;
    mockedCreate.mockResolvedValueOnce(fakeResult);

    const req = {
      body: {
        title: "Fix bug login",
        list_id: 1,
        position: 1000,
        description: "Bug critique",
      },
    } as Request;
    const res = mockResponse();

    await createCard(req, res);

    expect(mockedCreate).toHaveBeenCalledWith(
      "Fix bug login",
      1,
      1000,
      "Bug critique",
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  it("doit utiliser une description vide par défaut si elle n'est pas fournis", async () => {
    const fakeResult = { insertId: 21, affectedRows: 1 } as ResultSetHeader;
    mockedCreate.mockResolvedValueOnce(fakeResult);

    const req = {
      body: { title: "Nouvelle carte", list_id: 2, position: 2000 },
    } as Request;
    const res = mockResponse();

    await createCard(req, res);

    expect(mockedCreate).toHaveBeenCalledWith("Nouvelle carte", 2, 2000, "");
  });
});

describe("cardController - updateCard()", () => {
  it("doit mettre à jour une carte et retourner 204", async () => {
    mockedUpdate.mockResolvedValueOnce(undefined);

    const req = {
      params: { id: "20" },
      body: {
        title: "Titre modifié",
        description: "Desc",
        list_id: 1,
        position: 500,
      },
    } as unknown as Request;
    const res = mockResponse();

    await updateCard(req, res);

    expect(mockedUpdate).toHaveBeenCalledWith(20, {
      title: "Titre modifié",
      description: "Desc",
      list_id: 1,
      position: 500,
    });
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it("doit convertir l'id de la carte en nombre avant d'apeller le model", async () => {
    mockedUpdate.mockResolvedValueOnce(undefined);

    const req = {
      params: { id: "15" },
      body: { title: "Test" },
    } as unknown as Request;
    const res = mockResponse();

    await updateCard(req, res);

    expect(typeof mockedUpdate.mock.calls[0][0]).toBe("number");
    expect(mockedUpdate.mock.calls[0][0]).toBe(15);
  });

  it("doit accepter une mise à jours partielle (seulement title)", async () => {
    mockedUpdate.mockResolvedValueOnce(undefined);

    const req = {
      params: { id: "5" },
      body: { title: "Seulement le titre" },
    } as unknown as Request;
    const res = mockResponse();

    await updateCard(req, res);

    expect(mockedUpdate).toHaveBeenCalledWith(5, {
      title: "Seulement le titre",
      description: undefined,
      list_id: undefined,
      position: undefined,
    });
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });
});

describe("cardController - getCardsByList()", () => {
  it("doit retourner les cartes d'une liste avec status 200", async () => {
    const fakeCards: CardRow[] = [
      {
        id: 1,
        title: "Card A",
        list_id: 3,
        position: 1000,
        description: "",
        constructor: { name: "RowDataPacket" },
      } as CardRow,
      {
        id: 2,
        title: "Card B",
        list_id: 3,
        position: 2000,
        description: "desc",
        constructor: { name: "RowDataPacket" },
      } as CardRow,
    ];
    mockedGetByList.mockResolvedValueOnce(fakeCards as RowDataPacket[]);

    const req = {
      params: { listId: "3" },
    } as unknown as Request;
    const res = mockResponse();

    await getCardsByList(req, res);

    expect(mockedGetByList).toHaveBeenCalledWith(3);
    expect(res.json).toHaveBeenCalledWith(fakeCards);
  });

  it("doit retourner un tableau vide si la liste n'as pas de cartes", async () => {
    mockedGetByList.mockResolvedValueOnce([] as RowDataPacket[]);

    const req = {
      params: { listId: "99" },
    } as unknown as Request;
    const res = mockResponse();

    await getCardsByList(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });
});
