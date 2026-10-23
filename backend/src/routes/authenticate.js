import { Router } from "express";
import bcrypt from "bcrypt";
import passport from "../passport.js";
import { pool } from "../database.js";
import { validate } from "../middleware/validation.js";
import { ensureAuthentication } from "../middleware/ensureAuthentication.js";
import { registerDatabase, LoginDatabase } from "../validators/authentication.js";

const router = Router();

router.post("/register", validate(registerDatabase), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      "INSERT INTO users (user_name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id AS id, user_name AS name, email",
      [name, email, passwordHash]
    );

    req.login(rows[0], (err) => {
      if (err) return next(err);
      res.status(201).json({ user: rows[0] });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", validate(LoginDatabase), (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info?.message || "Login failed" });

    req.login(user, (err) => {
      if (err) return next(err);
      res.json({ user: { id: user.user_id, name: user.user_name, email: user.email } });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
});

router.get("/me", ensureAuthentication, (req, res) => {
  res.json({ user: req.user });
});

export default router;