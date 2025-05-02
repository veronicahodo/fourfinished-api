import { param, body, validationResult } from "express-validator";

export const validatePostPutAssign = [
    param("taskId")
        .exists()
        .withMessage("Task ID is required")
        .isString()
        .withMessage("Task ID must be a string")
        .matches(/^task_/)
        .withMessage("Task ID must start with 'task_'"),
    param("userId")
        .exists()
        .withMessage("User ID is required")
        .isString()
        .withMessage("User ID must be a string")
        .matches(/^user_/)
        .withMessage("User ID must start with 'user_'"),
    param("role")
        .exists()
        .withMessage("Role is required")
        .isString()
        .withMessage("Role must be a string")
        .isIn(["manage", "edit", "view"])
        .withMessage("Role must be 'manage', 'edit', or 'view'"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validateDeleteAssign = [
    param("taskId")
        .exists()
        .withMessage("Task ID is required")
        .isString()
        .withMessage("Task ID must be a string")
        .matches(/^task_/)
        .withMessage("Task ID must start with 'task_'"),
    param("userId")
        .exists()
        .withMessage("User ID is required")
        .isString()
        .withMessage("User ID must be a string")
        .matches(/^user_/)
        .withMessage("User ID must start with 'user_'"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    },
];
