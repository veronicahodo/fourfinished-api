import { body, validationResult } from "express-validator";

export const validatePostTask = [
    body("title")
        .exists()
        .withMessage("title is required")
        .isString()
        .withMessage("title must be a string")
        .isLength({ min: 1, max: 255 })
        .withMessage("title must be between 1 and 255 characters")
        .trim(),
    body("description")
        .optional({ values: "null" })
        .isString()
        .withMessage("description must be a string")
        .trim(),
    body("completion")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("completion must be a float"),
    body("tags").optional().isArray().withMessage("tags must be an array"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        return next();
    },
];

export const validatePutTask = [
    body("title")
        .optional()
        .isString()
        .withMessage("title must be a string")
        .isLength({ min: 1, max: 255 })
        .withMessage("title must be between 1 and 255 characters")
        .trim(),
    body("description")
        .optional({ values: "null" })
        .isString()
        .withMessage("description must be a string")
        .trim(),
    body("completion")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("completion must be a float"),
    body("archived")
        .optional()
        .isBoolean()
        .withMessage("archived must be boolean"),
    body("tags").optional().isArray().withMessage("tags must be an array"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        return next();
    },
];
