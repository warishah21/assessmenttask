import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { pool } from "./database.js";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = rows[0];
      const ok = user && (await bcrypt.compare(password, user.password_hash));
      if (!ok) return done(null, false, { message: "Invalid email or password" });
      done(null, user);
    } catch (err) {
      done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.user_id));

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query(
      "SELECT user_id AS id, user_name AS name, email FROM users WHERE user_id = $1",
      [id]
    );
    done(null, rows[0] || false);
  } catch (err) {
    done(err);
  }
});

export default passport;