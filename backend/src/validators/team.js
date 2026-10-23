import Joi from "joi";

export const schemaTeam = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
});

export const addMemberSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
});