const request = require("supertest");

const app = require("../src/app");
const database = require("../database");
afterAll(() => database.end());

// test pour la route GET

describe("GET /api/movies", () => {
  // test pour retourner tout les films
  it("should return all movies", async () => {
    const response = await request(app).get("/api/movies");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

// test pour retourner un film par son id
describe("GET /api/movies/:id", () => {
  it("should return one movie", async () => {
    const response = await request(app).get("/api/movies/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  // test pour gerer les erreurs
  it("should return no movie", async () => {
    const response = await request(app).get("/api/movies/0");

    expect(response.status).toEqual(404);
  });
});

// test pour la route POST
// test pour créer un film
describe("POST /api/movies", () => {
  it("should return created movie", async () => {
    const newMovie = {
      title: "Star Wars",
      director: "George Lucas",
      year: "1977",
      color: true,
      duration: 120,
    };

    const response = await request(app).post("/api/movies").send(newMovie);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [postResult] = await database.query(
      "SELECT * FROM movies WHERE id=?",
      response.body.id
    );

    const [movieInDatabase] = postResult;

    expect(movieInDatabase).toHaveProperty("id");
    expect(movieInDatabase).toHaveProperty("title");
    expect(typeof movieInDatabase.title).toBe("string");

    expect(movieInDatabase).toHaveProperty("director");
    expect(typeof movieInDatabase.director).toBe("string");

    expect(movieInDatabase).toHaveProperty("year");
    expect(typeof movieInDatabase.year).toBe("string");

    expect(movieInDatabase).toHaveProperty("color");
    expect(typeof movieInDatabase.color).toBe("string");

    expect(movieInDatabase).toHaveProperty("duration");
    expect(typeof movieInDatabase.duration).toBe("number");
  });

  // test pour gerer les erreurs
  it("should return an error", async () => {
    const movieWithMissingProps = { title: "Harry Potter" };

    const response = await request(app)
      .post("/api/movies")
      .send(movieWithMissingProps);

    expect(response.status).toEqual(500);
  });
});

// TEST LA ROUTE PUT
// test pour modifier un movie

describe("PUT /api/movies/:id", () => {
  it("should edit movie", async () => {
    const newMovie = {
      title: "Avatar",
      director: "James Cameron",
      year: "2010",
      color: "1",
      duration: 162,
    };

    const [result] = await database.query(
      "INSERT INTO movies(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
      [
        newMovie.title,
        newMovie.director,
        newMovie.year,
        newMovie.color,
        newMovie.duration,
      ]
    );

    const id = result.insertId;

    const updatedMovie = {
      title: "Wild is life",
      director: "Alan Smithee",
      year: "2023",
      color: "0",
      duration: 120,
    };

    const response = await request(app)
      .put(`/api/movies/${id}`)
      .send(updatedMovie);

    expect(response.status).toEqual(204);

    const [updateResult] = await database.query(
      "SELECT * FROM movies WHERE id=?",
      id
    );

    const [movieInDatabase] = updateResult;

    expect(movieInDatabase).toHaveProperty("id");

    expect(movieInDatabase).toHaveProperty("title");
    expect(typeof movieInDatabase.title).toBe('string');
    expect(movieInDatabase.title).toStrictEqual(updatedMovie.title);
  
    expect(movieInDatabase).toHaveProperty("director");
    expect(typeof movieInDatabase.director).toBe('string');
    expect(movieInDatabase.director).toStrictEqual(updatedMovie.director);
  
    expect(movieInDatabase).toHaveProperty("year");
    expect(typeof movieInDatabase.year).toBe('string');
    expect(movieInDatabase.year).toStrictEqual(updatedMovie.year);
  
    expect(movieInDatabase).toHaveProperty("color");
    expect(typeof movieInDatabase.color).toBe('string');
    expect(movieInDatabase.color).toStrictEqual(updatedMovie.color);
  
    expect(movieInDatabase).toHaveProperty("duration");
    expect(typeof movieInDatabase.duration).toBe('number');
    expect(movieInDatabase.duration).toStrictEqual(updatedMovie.duration);
  });
  
  it("should return an error", async () => {
    const movieWithMissingProps = { title: "Harry Potter" };

    const response = await request(app)
      .put(`/api/movies/1`)
      .send(movieWithMissingProps);

    expect(response.status).toEqual(500);
  });

  it("should return no movie", async () => {
    const newMovie = {
      title: "Avatar",
      director: "James Cameron",
      year: "2009",
      color: "1",
      duration: 162,
    };

    const response = await request(app).put("/api/movies/0").send(newMovie);

    expect(response.status).toEqual(404);
  });
});
