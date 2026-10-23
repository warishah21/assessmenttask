import { isMember } from "../membership.js";
import { asyncHandler } from "./asyncHandler.js";

export const requireTeamMember = asyncHandler(async (req, res, next) => {
    const teamID = Number((req.params.id));
    if (!Number.isInteger(teamID)) {
        return res.status(400).json({message: "Invalid team id"});
    }
    if(!(await isMember(teamID,req.user.id))){
        return res.status(404).json({message: "Team not found"});
    }
    req.teamID=teamID;
    next();
});