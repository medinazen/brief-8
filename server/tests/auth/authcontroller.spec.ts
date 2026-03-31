import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import * as jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";
import { login } from "../../src/modules/auth/authController";
import * as UserModel from "../../src/modules/user/userModel";

jest.mock("../../src/modules/user/userModel");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
};

const mockedGetUserByEmail = jest.mocked(UserModel.getUserByEmail);
const mockedBcryptCompare = jest.mocked(bcrypt.compare);
const mockedJwtSign = jest.mocked(jwt.sign);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("authController - login()", () => {
  it("doit retourner 400 si email ou mot de passe est abssent", async () => {
    const req = { body: { email: "", password: "" } } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email et mot de passe requis",
    });
  });

  it("doit retourner 401 si l'utilisateur n'existe pas en base", async () => {
    mockedGetUserByEmail.mockResolvedValueOnce([] as RowDataPacket[]);

    const req = {
      body: { email: "inconnu@test.com", password: "pass123" },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(mockedGetUserByEmail).toHaveBeenCalledWith("inconnu@test.com");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Identifiants invalides",
    });
  });

  it("doit retourner 401 si le mot de passe est incorrect", async () => {
    const fakeUser = {
      id: 1,
      email: "jean@test.com",
      firstname: "Jean",
      lastname: "Dupont",
      password: "hashedpassword",
      constructor: { name: "RowDataPacket" },
    } as UserRow;

    mockedGetUserByEmail.mockResolvedValueOnce([fakeUser] as RowDataPacket[]);
    mockedBcryptCompare.mockResolvedValueOnce(false as never);

    const req = {
      body: { email: "jean@test.com", password: "mauvaismdp" },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(mockedBcryptCompare).toHaveBeenCalledWith(
      "mauvaismdp",
      "hashedpassword",
    );
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("doit retourner 200 et poser un cookie si les identifiant sont valid", async () => {
    const fakeUser = {
      id: 1,
      email: "jean@test.com",
      firstname: "Jean",
      lastname: "Dupont",
      password: "hashedpassword",
      constructor: { name: "RowDataPacket" },
    } as UserRow;

    mockedGetUserByEmail.mockResolvedValueOnce([fakeUser] as RowDataPacket[]);
    mockedBcryptCompare.mockResolvedValueOnce(true as never);
    mockedJwtSign.mockReturnValueOnce("fake.jwt.token" as never);

    process.env.JWT_SECRET = "testsecret";

    const req = {
      body: { email: "jean@test.com", password: "bonmdp" },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      "access_token",
      "fake.jwt.token",
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Connexion réussie" });
  });

  it("doit retourner 500 si JWT_SECRET est manquant dans la config", async () => {
    const fakeUser = {
      id: 1,
      email: "jean@test.com",
      firstname: "Jean",
      lastname: "Dupont",
      password: "hashedpassword",
      constructor: { name: "RowDataPacket" },
    } as UserRow;

    mockedGetUserByEmail.mockResolvedValueOnce([fakeUser] as RowDataPacket[]);
    mockedBcryptCompare.mockResolvedValueOnce(true as never);

    process.env.JWT_SECRET = undefined as unknown as string;

    const req = {
      body: { email: "jean@test.com", password: "bonmdp" },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Configuration serveur manquante",
    });
  });

  it("doit gérer les érreurs inattendues et retourner 500", async () => {
    mockedGetUserByEmail.mockRejectedValueOnce(new Error("DB crash"));

    const req = {
      body: { email: "jean@test.com", password: "bonmdp" },
    } as Request;
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erreur serveur" });
  });
});
