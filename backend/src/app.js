import "dotenv/config"; 
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./database.js";
import passport from "./passport.js";
import authRoutes from "./routes/authenticate.js";
import { ensureAuthentication } from "./middleware/ensureAuthentication.js";
import teamRoutes from "./routes/team.js";
import taskRoutes from "./routes/task.js";

const app = express();
const isProd = process.env.NODE_ENV === "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json({ limit: "10kb" }));

const PgStore = connectPgSimple(session);
app.use(
  session({
    store: isProd ? new PgStore({ pool, createTableIfMissing: true }) : undefined,
    secret: process.env.SESSION_SECRET  || "development_fallback_secret_key_12345",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, 
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true })
);
app.use("/api/auth", authRoutes);

app.use("/api/teams", ensureAuthentication, teamRoutes);
app.use("/api/tasks",ensureAuthentication ,taskRoutes);

if (isProd) {
  const dist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(dist));
  app.get("/{*splat}", (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API running on port ${port}`));