const express = require("express");
const {
	handleGenerateNewShortURL,
	handleGetURLAnalytics,
	handleGetURLFromId,
} = require("../controller/url");

const router = express.Router();

router.post("/", handleGenerateNewShortURL);
router.get("/analytics/:shortid", handleGetURLAnalytics);
router.get("/:shortid", handleGetURLFromId);

module.exports = router;
