import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { create, getAllUser } from "../../src/modules/user/userController";
import * as UserModel from "../../src/modules/user/userModel";

jest.mock("../../src/modules/user/userModel");
jest.mock("bcrypt");

type UserRow = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
};

const mockedGetAll = jest.mocked(UserModel.getAll);
const mockedGetUserByEmail = jest.mocked(UserModel.getUserByEmail);
const mockedCreateUser = jest.mocked(UserModel.createUser);
const mockedHash = jest.mocked(bcrypt.hash);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("userController - getAllUser()", () => {
  it("doit retourner la liste de tout les utlisateurs avec status 200", async () => {
    const fakeUsers: UserRow[] = [
      {
        id: 1,
        email: "a@test.com",
        firstname: "Alice",
        lastname: "M",
        password: "h",
      } as UserRow,
      {
        id: 2,
        email: "b@test.com",
        firstname: "Bob",
        lastname: "D",
        password: "h",
      } as UserRow,
    ];
    mockedGetAll.mockResolvedValueOnce(fakeUsers as RowDataPacket[]);

    const req = {} as Request;
    const res = mockResponse();

    await getAllUser(req, res);

    expect(mockedGetAll).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUsers);
  });

  it("doit retourner 500 si la base de données plantte", async () => {
    mockedGetAll.mockRejectedValueOnce(new Error("DB error"));

    const req = {} as Request;
    const res = mockResponse();

    await getAllUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("userController - create()", () => {
  it("doit retourner 401 si l'email est déja utilisé", async () => {
    const existingUser = {
      id: 1,
      email: "exist@test.com",
      firstname: "Jean",
      lastname: "D",
      password: "hashed",
    } as UserRow;

    mockedGetUserByEmail.mockResolvedValueOnce([
      existingUser,
    ] as RowDataPacket[]);

    const req = {
      body: {
        email: "exist@test.com",
        firstname: "Jean",
        lastname: "D",
        password: "pass",
      },
    } as Request;
    const res = mockResponse();

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Non autorisé" });
  });

  it("doit créer un utilisateur et retourner 201 si tout est ok", async () => {
    mockedGetUserByEmail.mockResolvedValueOnce([] as RowDataPacket[]);
    mockedHash.mockResolvedValueOnce("hashedpassword123" as never);
    mockedCreateUser.mockResolvedValueOnce({
      insertId: 42,
      affectedRows: 1,
    } as ResultSetHeader);

    const req = {
      body: {
        email: "nouveau@test.com",
        firstname: "Paul",
        lastname: "Martin",
        password: "monmotdepasse",
      },
    } as Request;
    const res = mockResponse();

    await create(req, res);

    expect(mockedHash).toHaveBeenCalledWith("monmotdepasse", 10);
    expect(mockedCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "nouveau@test.com",
        password: "hashedpassword123",
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("doit retourner 404 si le body est abssent de la requete", async () => {
    const req = { body: null } as unknown as Request;
    const res = mockResponse();

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("doit retourner 500 si insertId est absent après la creation", async () => {
    mockedGetUserByEmail.mockResolvedValueOnce([] as RowDataPacket[]);
    mockedHash.mockResolvedValueOnce("hashed" as never);
    mockedCreateUser.mockResolvedValueOnce({
      insertId: 0,
      affectedRows: 0,
    } as ResultSetHeader);

    const req = {
      body: {
        email: "test@test.com",
        firstname: "T",
        lastname: "T",
        password: "p",
      },
    } as Request;
    const res = mockResponse();

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erreur" });
  });
});
