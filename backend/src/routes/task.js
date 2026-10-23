import { Router } from "express";
import { pool } from "../database.js";
import { isMember } from "../membership.js";
import { validate } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { taskSchema, updateTaskSchema, taskQuerySchema } from "../validators/tasks.js";

const router = Router();

const SELECT_TASKS = `
  SELECT t.id, t.team_id AS "teamId", te.name AS "teamName", t.title, t.description,
         t.status, to_char(t.due_date, 'YYYY-MM-DD') AS "dueDate",
         t.assignee_id AS "assigneeId", u.user_name AS "assigneeName",
         t.created_by AS "createdBy"
    FROM task t
    JOIN team te ON te.id = t.team_id
    LEFT JOIN users u ON u.user_id = t.assignee_id
   WHERE EXISTS (SELECT 1 FROM team_member tm
                  WHERE tm.team_id = t.team_id AND tm.user_id = $1)`;

const findTask = async (taskId, userId) => {
  const { rows } = await pool.query(`${SELECT_TASKS} AND t.id = $2`, [userId, taskId]);
  return rows[0] || null;
};

const parseId = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid task id" });
    return null;
  }
  return id;
};

router.get(
  "/",
  validate(taskQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { teamId, assigneeId, status, q } = req.query;
    const params = [req.user.id.toString()];
    let sql = SELECT_TASKS;

  const add = (clause, values) => {
  const vals = Array.isArray(values) ? values : [values];
  
  let dynamicClause = clause;
  for (const item of vals) {
        params.push(item);
      
        dynamicClause = dynamicClause.replace("?", `$${params.length}`);
      }


  sql += ` AND ${dynamicClause}`;
};

    if (teamId) add("t.team_id = ?", teamId);
    if (assigneeId) add("t.assignee_id = ?", assigneeId);
    if (status) add("t.status = ?", status);
    if (q) add("(t.title ILIKE ? OR t.description ILIKE ?)", [`%${q}%`, `%${q}%`]);

    sql += " ORDER BY t.due_date NULLS LAST, t.id DESC";
    const { rows } = await pool.query(sql, params);
    res.json({ tasks: rows });
  })
);

router.post(
  "/",
  validate(taskSchema),
  asyncHandler(async (req, res) => {
    const { teamId, title, description, status, dueDate, assigneeId } = req.body;

    if (!(await isMember(teamId, req.user.id))) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }
    if (assigneeId && !(await isMember(teamId, assigneeId))) {
      return res.status(400).json({ message: "Assignee must be a team member" });
    }

    const { rows } = await pool.query(
      `INSERT INTO task (team_id, title, description, status, due_date, assignee_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [teamId, title, description, status, dueDate, assigneeId, req.user.id]
    );
    res.status(201).json({ task: await findTask(rows[0].id, req.user.id) });
  })
);

router.put(
  "/:id",
  validate(updateTaskSchema),
  asyncHandler(async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;

    const existing = await findTask(id, req.user.id);
    if (!existing) return res.status(404).json({ message: "Task not found" });

    const { title, description, status, dueDate, assigneeId } = req.body;
    if (assigneeId && !(await isMember(existing.teamId, assigneeId))) {
      return res.status(400).json({ message: "Assignee must be a team member" });
    }

    await pool.query(
      `UPDATE task SET title = $1, description = $2, status = $3,
              due_date = $4, assignee_id = $5 WHERE id = $6`,
      [title, description, status, dueDate, assigneeId, id]
    );
    res.json({ task: await findTask(id, req.user.id) });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;

    const existing = await findTask(id, req.user.id);
    if (!existing) return res.status(404).json({ message: "Task not found" });

    await pool.query("DELETE FROM task WHERE id = $1", [id]);
    res.json({ message: "Task deleted" });
  })
);

export default router;