import passport from "passport";
import github from "passport-github2";
import jwt from "passport-jwt";
import dotenv from "dotenv";
import { User } from "../dao/models/user.model.js";

dotenv.config();
const searchingToken = (req) => {
  let token = null;

  if (req.signedCookies.naviCookie) {
    console.log("Cookie found");
    token = req.signedCookies.naviCookie;
  }

  return token;
};

export const initPassport = () => {
  passport.use(
    "jwt",
    new jwt.Strategy(
      {
        secretOrKey: process.env.COOKIE_SECRET,
        jwtFromRequest: new jwt.ExtractJwt.fromExtractors([searchingToken]),
        passReqToCallback: true,
      },
      async (req, jwtPayload, done) => {
        try {
          const user = await User.findById(jwtPayload.id);
          if (!user) {
            return done(null, false, { message: "Usuario no encontrado" });
          }
          req.user = user;
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
        // clientID: "Iv1.a46ac1227c23b147",
        // clientSecret: "e4cfac7071da870832e6e0eb4e22cf698752b8c8",
        callbackURL: "http://localhost:8080/api/sessions/callbackGithub",
      },
      async function (accessToken, refreshToken, profile, done) {
        // console.log(profile);
        try {
          let fullName = profile._json.name;
          let email = profile._json.email;
          if (!email) {
            return done(null, false);
          }

          let name = fullName.split(" ");

          let user = await User.findOne({ email: email });
          if (!user) {
            user = await User.create({
              first_name: name[0],
              last_name: name[1],
              email,
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
