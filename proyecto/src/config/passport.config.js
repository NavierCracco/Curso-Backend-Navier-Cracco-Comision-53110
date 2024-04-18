import passport from "passport";
import github from "passport-github2";
import local from "passport-local";
import bcrypt from "bcrypt";
import { User } from "../dao/models/user.model.js";
import { Cart } from "../dao/models/cart.model.js";

export const initPassport = () => {
  passport.use(
    "register",
    new local.Strategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },

      async (req, username, password, done) => {
        try {
          let { username, email } = req.body;
          const hashedPassword = await bcrypt.hash(password, 10);

          if (email === User.findOne({ email: email })) {
            // return res.status(400).json({ error: "Email already exists" });
            return done(null, false);
          }

          const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "usuario",
          });
          await Cart.create({ products: [] });

          await user.save();

          // res.redirect("/api/sessions/login");
          // res.status(201).json({ message: "User registered successfully", user });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new local.Strategy(
      {
        usernameField: "email",
      },

      async (username, password, done) => {
        try {
          let user = await User.findOne({ email: username });

          // const adminUser = {
          //   username: "Batman",
          //   email: "adminCoder@coder.com",
          //   password: "adminCod3r123",
          //   role: "admin",
          // };

          if (!user || !(await bcrypt.compare(password, user.password))) {
            return done(null, false);
          }
          user = { ...user._doc };
          delete user.password;

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new github.Strategy(
      {
        clientID: "Iv1.a46ac1227c23b147",
        clientSecret: "e4cfac7071da870832e6e0eb4e22cf698752b8c8",
        callbackURL: "http://localhost:8080/api/sessions/callbackGithub",
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          let name = profile._json.name;
          let email = profile._json.email;
          if (!email) {
            return done(null, false);
          }

          let user = await User.findOne({ email: email });
          if (!user) {
            user = await User.create({
              username: name,
              email,
              role: "usuario",
              profileGithub: profile,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
