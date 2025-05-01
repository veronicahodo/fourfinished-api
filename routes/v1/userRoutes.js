import express from "express";
import {
    getUser,
    postUser,
    putUser,
} from "../../controllers/v1/userController.js";
import { postUserAuthenticate } from "../../controllers/v1/userAuthController.js";
import {
    validatePostUser,
    validatePostUserAuthenticate,
} from "../../validators/v1/userValidator.js";
import { secureAuthenticate } from "../../middleware/auth.js";

const router = express.Router();

router.get("/:userId", secureAuthenticate, getUser);
router.get("/", secureAuthenticate, getUser);

router.post("/signup", validatePostUser, postUser);
router.post(
    "/authenticate",
    validatePostUserAuthenticate,
    postUserAuthenticate
);

router.put("/", secureAuthenticate, putUser);

export default router;
