import { body, validationResult } from "express-validator";

export const validatePostUser = [
    body("email")
        .exists()
        .withMessage("email is required")
        .isEmail()
        .withMessage("email is invalid"),
    body("password").exists().withMessage("password is required"),
    body("first_name")
        .exists()
        .withMessage("first_name is required")
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage("first_name must be between 1 and 50 characters"),
    body("last_name")
        .exists()
        .withMessage("last_name is required")
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage("last_name must be between 1 and 50 characters"),
    body("language")
        .optional({ values: null })
        .isString()
        .isLength({ min: 2, max: 2 })
        .withMessage(
            "language must be a valid language code (en, es, fr, etc.)"
        ),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validatePostUserAuthenticate = [
    body("email")
        .exists()
        .withMessage("email is required")
        .isEmail()
        .withMessage("email is invalid"),
    body("password")
        .exists()
        .withMessage("password is required")
        .isString()
        .isLength({ min: 8, max: 50 })
        .withMessage("password must be between 8 and 50 characters"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validatePutUser = [
    body("first_name")
        .optional()
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage("first_name must be between 1 and 50 characters"),
    body("last_name")
        .optional()
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage("last_name must be between 1 and 50 characters"),
    body("language")
        .optional()
        .isString()
        .isLength({ min: 2, max: 2 })
        .withMessage(
            "language must be a valid language code (en, es, fr, etc.)"
        ),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
