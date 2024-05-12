import passport from "passport";
import github from "passport-github2";
import jwt from "passport-jwt";
import { UserMongoDao } from "../dao/UserMongoDAO.js";
import { config } from "./config.js";

const userDao = new UserMongoDao();
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
        secretOrKey: config.general.COOKIE_SECRET,
        jwtFromRequest: new jwt.ExtractJwt.fromExtractors([searchingToken]),
        passReqToCallback: true,
      },
      async (req, jwtPayload, done) => {
        try {
          const user = await userDao.getById(jwtPayload.id);
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
        clientID: config.github.CLIENT_ID,
        clientSecret: config.github.CLIENT_SECRET,

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

          // let user = await User.findOne({ email: email });
          let user = await userDao.getAll({ email });
          if (!user) {
            user = await userDao.create({
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
