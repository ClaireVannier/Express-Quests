require("dotenv").config();

const mysql = require("mysql2/promise");

const database = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

database
  .getConnection()
  .then(() => {
    console.log(`Database is connected on ${process.env.DB_PORT}`);
  })
  .catch((err) => {
    console.error(err);
  });

// Tu peux aussi l'écrire comme ça, .then est une méthode de l'objet database qui est lui même instancié de la classe Pool
// ce qu'il y a entre les () jaune de .then est une fonction de callback anonyme car elle ne prend pas de nom
// database
//   .getConnection()
//   .then(function() {
//     console.log("Connection OK");
// })
// .catch(function(err) {
//   console.error(err);
// })


module.exports = database;
