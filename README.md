Task Manager

-> Login/Register
-> Authentication
-> create delete members
-> CRUD tasks
-> filter tasks by team
-> input validation(JOI) and password hashing(bcrypt)
-> UI built with react and Tailwind Css

Project Structure:
Root Folder: taskmanager
-> backend/
database.sql
.env
src/ 
app.js
database.js
passport.js
membership.js
middleware/
validators/
routes/
-> frontend/
src/
api.js
constants.js
context/
  components/
  pages/



Local Setup
------------
1.Clone the repository

git clone <repo>
cd taskmanager

2.Create Database

createdb taskmanager
psql taskmanager -f backend/database.sql

->Run the command in SQL Shell(psql)

3. Configure and start backend

cd backend
npm install
npm run dev

edit backend/.env
PORT=8080
NODE_ENV=development
DATABASE_URL=postgres://postgres:Your_Password@localhost:5432/taskmanager
SESSION_SECRET:any-long-random-string

THE API RUNS AT http://localhost:8080. In development sessions are stored in memory.

4. Start Frontend

cd frontend
npm install
npm run dev

OPEN http://localhost:5173

TECH STACK
----------

Frontend: React, Vite, TAILWIND CSS
Backend: Node.js, Express, Passport.js, express-session, Joi, bcrypt
Database: PostgresSQL
Sessions: PostgresSQL via connect-pg-simple
Hosting:

API Reference
-------------
All routes except register and login require an authenticated session (otherwise 401).
Auth       Method
/Route                    Description
POST  /api/auth/register  Create account and log in
POST  /api/auth/login     Log in
POST  /api/auth/logout    Log out
GET   /api/auth/me        Current user
Teams 
Route                     Description
GET   /api/teams          List teams the user belongs to
POST  /api/teams          Create a team
GET   /api/teams/:id      Team details and members
DELETE /api/teams/:id      Delete a team
POST  /api/teams/:id/members Add an existing user by email
Tasks Method
Route                     Description
GET   /api/tasks          List tasks. Filters: teamId,assigneeId, status, q
POST  /api/tasks          Create a task
PUT   /api/tasks/:id      Update a task
DELETE /api/tasks/:id     Delete a task


Security Practices
------------------
Passwords hashed with bcrypt (12 rounds); never stored or returned in plain text
Session cookies are httpOnly, sameSite=lax, and secure in production
Auth middleware protects every non-auth route
Joi validates and sanitizes all request bodies and query strings (unknown fields stripped)
All queries are parameterized to prevent SQL injection
Users can only read or modify teams and tasks for teams they belong to
Helmet security headers and rate limiting on auth routes


Deployment 
----------
Create a Cloud SQL for PostgreSQL instance and a database, then run backend/schema.sql against it.
Build the frontend (cd frontend && npm run build). In production, Express serves frontend/dist.
Deploy the container to Cloud Run with these environment variables:
NODE_ENV=production
SESSION_SECRET=<long random string>
DATABASE_URL=<Cloud SQL connection string>
Attach the Cloud SQL instance to the Cloud Run service.


Git Workflow
------------
Work was done on feature branches and merged into main through pull requests:
feat/auth
feat/teams
feat/tasks
feat/frontend
chore/deploy







