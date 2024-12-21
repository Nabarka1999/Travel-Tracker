import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  host: "localhost",
  user: "postgres",
  database: "world",
  port: 5432,
  password: "pql1234",
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {
  const result = await db.query("select country_code from visited_countries");
  let countries = [];
  result.rows.forEach((element) => {
    countries.push(element.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: countries.length });
  // db.end();
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countrycode = data.country_code;
    try {
      await db.query(
        "insert into visited_countries (country_code) values ($1)",
        [countrycode]
      );
      res.redirect("/");
    } catch (err) {
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, put another country name.",
      });
    }
  } catch (err) {
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, Try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});