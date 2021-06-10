const express = require("express");
const next = require("next");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
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

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, done) {
      if (!email || !password) {
        done("Email and password required", null);
        return;
      }
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        done("User not found", null);
        return;
      }
      const valid = await user.isPasswordValid(password);
      if (!valid) {
        done("Email and password do not match", null);
        return;
      }
      done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.email);
});
passport.deserializeUser((email, done) => {
  User.findOne({ where: { email: email } }).then((user) => {
    done(null, user);
  });
});

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
    }),
    passport.initialize(),
    passport.session()
  );

  server.all("*", (req, res) => {
    return handle(req, res);
  });
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});