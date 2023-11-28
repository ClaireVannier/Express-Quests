const app = require("./src/app");
require("dotenv").config();
const port = process.env.APP_PORT;


app
  .listen(port, () => {
    console.log(`API is listening on ${port}`);
  })
  .on("error", (err) => {
    console.error("Error:", err.message);
  });