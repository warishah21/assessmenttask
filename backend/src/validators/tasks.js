import Joi from "joi";

const STATUSES = ["todo","in_progess","done"];

export const taskSchema = Joi.object({
    teamId: Joi.number().integer().required(),
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().allow("").max(2000).default(""),
    status: Joi.string().valid(...STATUSES).default("todo"),
    dueDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null).empty("").default(null),
    assigneeId: Joi.number().integer().allow(null).empty("").default(null),
});

export const updateTaskSchema = taskSchema.keys({ teamId: Joi.any().strip()});

export const taskQuerySchema = Joi.object({
    teamId: Joi.number().integer(),
    assigneeId: Joi.number().integer(),
    status: Joi.string().valid(...STATUSES),
    q: Joi.string().trim().max(100).allow(""),
});