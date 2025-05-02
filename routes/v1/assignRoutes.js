import express from "express";
import {
    validateDeleteAssign,
    validatePostPutAssign,
} from "../../validators/v1/assignValidator";
import { secureAuthenticate } from "../../middleware/auth";
import {
    deleteAssign,
    postAssign,
    putAssign,
} from "../../controllers/v1/assignController";

const router = express.Router();

router.post(
    "/:taskId/:userId/:role",
    validatePostPutAssign,
    secureAuthenticate,
    postAssign
);

router.put(
    "/:taskId/:userId/:role",
    validatePostPutAssign,
    secureAuthenticate,
    putAssign
);

router.delete(
    "/:taskId/:userId",
    validateDeleteAssign,
    secureAuthenticate,
    deleteAssign
);

export default router;
