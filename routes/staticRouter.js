const express = require("express");
const URL = require("../models/url");
const { restrictTo } = require("../middlewares/auth");

const router = express();

router.get("/admin/urls", restrictTo(["ADMIN"]), async (req, res) => {
	const allURLs = await URL.find({});
	return res.render("home", {
		urls: allURLs,
	});
});

router.get("/", restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
	const allURLs = await URL.find({ createdBy: req.user._id });
	return res.render("home", {
		urls: allURLs,
		userName: req.user.name,
	});
});

router.get("/signup", async (req, res) => {
	return res.render("signup");
});
router.get("/login", async (req, res) => {
	return res.render("login");
});

module.exports = router;
