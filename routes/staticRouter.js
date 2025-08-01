const express = require("express");
const URL = require("../models/url");
const { restrictTo } = require("../middlewares/auth");

const router = express.Router();

/**
 * Dashboard: User URLs (Protected)
 */
router.get(
	"/",
	restrictTo(["USER", "ADMIN"]),
	async (req, res) => {
		try {
			const allURLs = await URL.find({
				createdBy: req.user._id,
			}).lean();
			return res.render("home", {
				urls: allURLs,
				userName: req.user.name,
			});
		} catch (err) {
			console.error(
				"❌ Error loading dashboard:",
				err.message
			);
			return res.status(500).render("500", {
				error: "Failed to load dashboard",
			});
		}
	}
);

/**
 * Signup Page (Public)
 */
router.get("/signup", (req, res) => res.render("signup"));

/**
 * Login Page (Public)
 */
router.get("/login", (req, res) => res.render("login"));

/**
 * Logout (Clears token cookie securely)
 */
router.get("/logout", (req, res) => {
	try {
		res.clearCookie("token", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // Only secure in prod
			sameSite: "Strict",
			path: "/",
		});
		return res.redirect("/login");
	} catch (err) {
		console.error("❌ Logout error:", err.message);
		return res
			.status(500)
			.render("500", { error: "Logout failed" });
	}
});

/**
 * Admin URLs Page (Admin-only)
 */
router.get(
	"/admin/urls",
	restrictTo(["ADMIN"]),
	async (req, res) => {
		try {
			const allURLs = await URL.find({})
				.populate("createdBy", "email name")
				.lean();
			return res.render("home", {
				urls: allURLs,
				userName: req.user.name,
			});
		} catch (err) {
			console.error(
				"❌ Admin URL fetch error:",
				err.message
			);
			return res.status(500).render("500", {
				error: "Failed to load admin URLs",
			});
		}
	}
);

module.exports = router;
