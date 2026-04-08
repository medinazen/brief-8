import "dotenv/config";
process.env.DB_NAME = "trello_test";
import supertest from "supertest";
import app from "../../../src/app";
import { clearTestDB, closeTestDB, setupTestDB } from "../../dbtest/dbtest";

beforeAll(async () => {
  await setupTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("POST /api/createUser", () => {
  it("doit créer un utlisateur et retourner 201", async () => {
    const newUser = {
      email: "jean@test.com",
      firstname: "Jean",
      lastname: "Dupont",
      password: "monmotdepasse",
    };

    const response = await supertest(app).post("/api/createUser").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "Utilisateur créé");
    expect(response.body.result).toHaveProperty("insertId");
  });

  it("doit retourner 401 si l'email est déja utlisé", async () => {
    const user = {
      email: "double@test.com",
      firstname: "Paul",
      lastname: "Martin",
      password: "pass123",
    };

    await supertest(app).post("/api/createUser").send(user);

    const response = await supertest(app).post("/api/createUser").send(user);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Non autorisé");
  });

  it("doit retourner 404 si le body est abssent de la requete", async () => {
    const response = await supertest(app).post("/api/createUser").send();

    expect(response.status).toBe(404);
  });

  it("doit hashé le mot de passe — ne jamais le stoker en clair", async () => {
    const user = {
      email: "hash@test.com",
      firstname: "Alice",
      lastname: "Hash",
      password: "motdepasseclair",
    };

    await supertest(app).post("/api/createUser").send(user);

    const loginResponse = await supertest(app)
      .post("/api/login")
      .send({ email: "hash@test.com", password: "motdepasseclair" });

    expect(loginResponse.status).toBe(200);
  });
});

describe("GET /api/getAll", () => {
  it("doit retourner un tableau vide si aucun utlisateur en base", async () => {
    const response = await supertest(app).get("/api/getAll");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("doit retourner la liste de tout les utlisateur créés", async () => {
    await supertest(app).post("/api/createUser").send({
      email: "a@test.com",
      firstname: "Alice",
      lastname: "A",
      password: "pass",
    });
    await supertest(app).post("/api/createUser").send({
      email: "b@test.com",
      firstname: "Bob",
      lastname: "B",
      password: "pass",
    });

    const response = await supertest(app).get("/api/getAll");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty("email", "a@test.com");
    expect(response.body[1]).toHaveProperty("email", "b@test.com");
  });

  it("doit jamais exposé les mots de passes dans la réponce", async () => {
    await supertest(app).post("/api/createUser").send({
      email: "secure@test.com",
      firstname: "Secure",
      lastname: "User",
      password: "supersecret",
    });

    const response = await supertest(app).get("/api/getAll");

    for (const user of response.body) {
      expect(user.password).not.toBe("supersecret");
    }
  });
});

describe("GET /api/getUser", () => {
  it("doit retourner 401 si aucun token n'est présent", async () => {
    const response = await supertest(app).get("/api/getUser");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Action non autorisée");
  });

  it("doit retourner 401 si le token est invalide", async () => {
    const response = await supertest(app)
      .get("/api/getUser")
      .set("Cookie", "access_token=token.invalide.ici");

    expect(response.status).toBe(401);
  });

  it("doit retourner les info de l'utlisateur connecté avec un token valide", async () => {
    await supertest(app).post("/api/createUser").send({
      email: "connect@test.com",
      firstname: "Connecté",
      lastname: "User",
      password: "bonpassword",
    });

    const loginRes = await supertest(app)
      .post("/api/login")
      .send({ email: "connect@test.com", password: "bonpassword" });

    const cookie = loginRes.headers["set-cookie"];

    const response = await supertest(app)
      .get("/api/getUser")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("email", "connect@test.com");
    expect(response.body).toHaveProperty("firstname", "Connecté");
  });
});
