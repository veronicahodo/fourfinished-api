import express from "express";
import { secureAuthenticate } from "../../middleware/auth.js";
import {
    deleteList,
    getList,
    getListAll,
    postList,
    putList,
} from "../../controllers/v1/listController.js";

const router = express.Router();

router.get("/all", secureAuthenticate, getListAll);
router.get("/:listId", secureAuthenticate, getList);

router.post("/", secureAuthenticate, postList);

router.put("/:listId", secureAuthenticate, putList);

router.delete("/:listId", secureAuthenticate, deleteList);

export default router;
