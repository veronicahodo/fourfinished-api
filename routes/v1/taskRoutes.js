import express from "express";
import { secureAuthenticate } from "../../middleware/auth.js";
import {
    getTask,
    getTaskChildren,
    postTask,
    postTaskNote,
    putTask,
} from "../../controllers/v1/taskController.js";
import {
    validatePostTask,
    validatePutTask,
} from "../../validators/v1/taskValidator.js";

const router = express.Router();

router.get("/:taskId", secureAuthenticate, getTask);
router.get("/:taskId/children", secureAuthenticate, getTaskChildren);

router.post("/:taskId/note", secureAuthenticate, postTaskNote);
router.post("/", validatePostTask, secureAuthenticate, postTask);

router.put("/:taskId", validatePutTask, secureAuthenticate, putTask);

export default router;
