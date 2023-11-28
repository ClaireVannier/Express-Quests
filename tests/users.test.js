const request = require("supertest");
const crypto = require("node:crypto");

const app = require("../src/app");
const database = require("../database");
afterAll(() => database.end());

// TEST POUR LA ROUTE GET
// test pour retourner tout les users
describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

// test pour récuperer un utilisateur par son id
describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  // test pour gerer les erreurs
  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});

// TEST POUR LA ROUTE POST
// test pour créer un nouvel utilisateur
describe("POST /api/users", () => {
  it("should return created user", async () => {
    const newUser = {
      firstname: "Marie",
      lastname: "Martin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French",
    };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [result] = await database.query(
      "SELECT * FROM users WHERE id=?",
      response.body.id
    );

    const [userInDatabase] = result;

    expect(userInDatabase).toHaveProperty("id");
    expect(userInDatabase).toHaveProperty("firstname");
    expect(typeof userInDatabase.firstname).toBe("string");

    expect(userInDatabase).toHaveProperty("lastname");
    expect(typeof userInDatabase.lastname).toBe("string");

    expect(userInDatabase).toHaveProperty("email");
    expect(typeof userInDatabase.email).toBe("string");

    expect(userInDatabase).toHaveProperty("city");
    expect(typeof userInDatabase.city).toBe("string");

    expect(userInDatabase).toHaveProperty("language");
    expect(typeof userInDatabase.language).toBe("string");
  });

  // test pour gerer les erreurs
  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Anna" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);
  });
});

// TEST POUR LA ROUTE PUT
// test pour modifier un utilisateur

describe("PUT /api/users/:id", () => {
  it("should edit user", async () => {
    const newUser = {
      firstname: "Fred",
      lastname: "Druet",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Bordeaux",
      language: "Francais",
    };

    const [result] = await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
      [
        newUser.firstname,
        newUser.lastname,
        newUser.email,
        newUser.city,
        newUser.language,
      ]
    );

    const id = result.insertId;

    const updatedUser = {
      firstname: "Raph",
      lastname: "Bard",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Bordeaux",
      language: "Francais",
    };

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updatedUser);

    expect(response.status).toEqual(204);

    const [updateResult] = await database.query(
      "SELECT * FROM users WHERE id=?",
      id
    );

    const [userInDatabase] = updateResult;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(typeof userInDatabase.firstname).toBe("string");
    expect(userInDatabase.firstname).toStrictEqual(updatedUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(typeof userInDatabase.lastname).toBe("string");
    expect(userInDatabase.lastname).toStrictEqual(updatedUser.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(typeof userInDatabase.email).toBe("string");
    expect(userInDatabase.email).toStrictEqual(updatedUser.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(typeof userInDatabase.city).toBe("string");
    expect(userInDatabase.city).toStrictEqual(updatedUser.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(typeof userInDatabase.language).toBe("string");
    expect(userInDatabase.language).toStrictEqual(updatedUser.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Anna" };

    const response = await request(app)
      .put(`/api/users/1`)
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);
  });

  it("should return no user", async () => {
    const newUser = {
      firstname: "Fred",
      lastname: "Druet",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "Francais",
    };

    const response = await request(app).put("/api/users/0").send(newUser);

    expect(response.status).toEqual(404);
  });
});
