import { Router } from "express";
import { pool } from "../database.js";
import { validate } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireTeamMember } from "../middleware/teamAccess.js";
import { schemaTeam, addMemberSchema } from "../validators/team.js";

const router = Router();

const getMember = async(teamId) => {
    const { rows } = await pool.query(
        `SELECT u.user_id AS id, u.user_name AS name, u.email FROM team_member tm JOIN users u ON u.user_id=tm.user_id WHERE tm.team_id=$1 ORDER BY u.user_name`,[teamId]);
        return rows;
};

router.get(
    "/",
    asyncHandler(async (req,res) => {
        const { rows } = await pool.query(
            `SELECT t.id,t.name FROM team t JOIN team_member tm ON tm.team_id = t.id WHERE tm.user_id=$1 ORDER BY t.name`,[req.user.id]);
        res.json({teams: rows});
    })
);


router.post(
    "/",
    validate(schemaTeam),
    asyncHandler(async (req,res) => {
        const client = await pool.connect();
        try{
            await client.query("BEGIN");
            const { rows }= await client.query(
                "INSERT INTO team (name,owner_id) VALUES ($1,$2) RETURNING id,name",[req.body.name,req.user.id]
            );
            await client.query(
                "INSERT INTO team_member (team_id, user_id) VALUES ($1,$2)",[rows[0].id,req.user.id]
            );
            await client.query("COMMIT");
            res.status(201).json({team: rows[0] });
        }
        catch(err){
            await client.query("ROLLBACK");
            throw err;
        }
        finally{
            client.release();
        }
    })
);

router.get(
    "/:id",
    requireTeamMember,asyncHandler(async (req,res) => {
        const { rows } = await pool.query(
            "SELECT id,name FROM team WHERE id = $1",[req.teamId]
        );
        res.json({ team: rows[0], members: await getMember(req.teamId)});
    })
);

router.delete(
    "/:id",
    requireTeamMember,asyncHandler(async (req,res) => {
        await pool.query("DELETE FROM team WHERE id=$1", [req.teamId]);
        res.json({message: "Team deleted"})
    })
);

router.post(
    "/:id/members",
    requireTeamMember,validate(addMemberSchema)
    ,asyncHandler(async(req,res)=>{
        const { rows } = await pool.query("SELECT id FROM users WHERE email=$1",[req.body.email,]);
        if(!rows[0]){
            return res.status(404).json({message:"No user found with that email"});
        }

        await pool.query(
            `INSERT INTO team_member (team_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [req.teamId, rows[0].user_id]
        );

        res.status(201).json({message:"Member added", members:await getMember(req.teamId)});
    })
);

export default router;