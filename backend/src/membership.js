import { pool } from "./database.js";

export async function isMember(teamID,userID) {
    const { rowCount } = await pool.query(
        "SELECT 1 FROM team_member WHERE team_id = $1 AND user_id=$2",[teamID,userID]
    );
    return rowCount > 0;
}