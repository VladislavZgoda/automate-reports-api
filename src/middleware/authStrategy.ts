import { compareSync } from "bcrypt-ts";
import passport from "passport";
import { Strategy } from "passport-local";
import { findUserByName, findUserById } from "../sql-queries/findUser.ts";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: number, done) => {
  try {
    const user = findUserById(id);

    if (!user) done(new Error("Not Found."), false);

    done(null, user);
  } catch (error) {
    console.log(error);
  }
})

export default passport.use(
  new Strategy({ usernameField: "login" }, (username, password, done) => {
    try {
      const user = findUserByName(username);

      if (!user) done(new Error("Invalid Credentials."), false);

      if (!compareSync(password, user!.password))
        done(new Error("Invalid Credentials."), false);

      done(null, user);
    } catch (error) {
      console.log(error);
    }
  }),
);
