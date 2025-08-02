import { Router } from "express";
import {
	handleUserSignup,
	handleUserLogin,
} from "../controller/user.js";

const router = Router();

router.post("/", handleUserSignup);
router.post("/login", handleUserLogin);

export default router;
