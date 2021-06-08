const express = require("express");
const next = require("next");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const User = require("./model.js").User;
const sequelize = require("./model.js").sequelize;

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const sessionStore = new SequelizeStore({
  db: sequelize,
});
sessionStore.sync();

nextApp.prepare().then(() => {
  const server = express();
  server.use(
    session({
      secret: "343ji43j4n3jn4jk3n", //enter a random stringhere
      resave: false,
      saveUninitialized: true,
      name: "nextbnb",
      cookie: {
        secure: false, //CRITICAL on localhost
        maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
      },
    })
  );

  server.all("*", (req, res) => {
    return handle(req, res);
  });
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
