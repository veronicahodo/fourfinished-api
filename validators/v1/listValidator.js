import { body, validationResult } from "express-validator";

export const validatePostList = [
    body("title")
        .exists()
        .withMessage("title is required")
        .isString()
        .withMessage("title must be a string")
        .isLength({ min: 1, max: 100 })
        .withMessage("title must be between 1 and 100 characters"),
    body("color")
        .optional({ values: null })
        .isString()
        .withMessage("color must be a string")
        .isLength({ min: 1, max: 20 })
        .withMessage("color must be between 1 and 20 characters"),
    body("icon")
        .optional({ values: null })
        .isString()
        .withMessage("icon must be a string")
        .isLength({ min: 1, max: 20 })
        .withMessage("icon must be between 1 and 20 characters"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
