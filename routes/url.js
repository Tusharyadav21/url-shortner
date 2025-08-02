import { Router } from "express";
import {
	handleGenerateNewShortURL,
	handleGetURLAnalytics,
	handleGetURLFromId,
} from "../controller/url.js";

const router = Router();

router.post("/", handleGenerateNewShortURL);
router.get("/analytics/:shortid", handleGetURLAnalytics);
router.get("/:shortid", handleGetURLFromId);

export default router;
