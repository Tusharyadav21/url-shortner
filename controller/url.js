const { nanoid } = require("nanoid");
const validator = require("validator");
const URL = require("../models/url");

// ✅ Rate limit config (Max 10 URL creations per 10 min per user)
const MAX_URLS_PER_WINDOW = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

async function handleGenerateNewShortURL(req, res) {
	try {
		const { url } = req.body;

		// 1️⃣ Validate URL input
		if (
			!url ||
			!validator.isURL(url, { require_protocol: true })
		) {
			return res
				.status(400)
				.render("home", {
					error: "Invalid or missing URL",
				});
		}

		// 2️⃣ Rate limiting: Count URLs created by this user in last 10 min
		const windowStart = new Date(Date.now() - WINDOW_MS);
		const recentCount = await URL.countDocuments({
			createdBy: req.user._id,
			createdAt: { $gte: windowStart },
		});
		if (recentCount >= MAX_URLS_PER_WINDOW) {
			return res.status(429).render("home", {
				error:
					"Rate limit exceeded. Please wait 10 minutes before creating more URLs.",
			});
		}

		// 3️⃣ Prevent duplicate short URLs for same user
		let existing = await URL.findOne({
			redirectedUrl: url,
			createdBy: req.user._id,
		});
		if (existing) {
			const allURLs = await URL.find({
				createdBy: req.user._id,
			}).lean();
			return res.render("home", {
				id: existing.shortId,
				userName: req.user.name,
				urls: allURLs,
			});
		}

		// 4️⃣ Generate new shortId
		const shortId = nanoid(8);
		await URL.create({
			shortId,
			redirectedUrl: url,
			createdBy: req.user._id,
		});

		const allURLs = await URL.find({
			createdBy: req.user._id,
		}).lean();
		return res.render("home", {
			id: shortId,
			userName: req.user.name,
			urls: allURLs,
		});
	} catch (err) {
		console.error("❌ Error generating short URL:", err);
		return res
			.status(500)
			.render("home", { error: "Internal Server Error" });
	}
}

async function handleGetURLFromId(req, res) {
	try {
		const shortId = req.params.shortid || req.params.id;

		const entry = await URL.findOneAndUpdate(
			{ shortId },
			{
				$push: { visitHistory: { timestamp: Date.now() } },
			},
			{ new: true }
		);

		if (!entry) {
			return res
				.status(404)
				.render("404", { error: "Short URL not found" });
		}

		return res.redirect(entry.redirectedUrl);
	} catch (err) {
		console.error("❌ Error redirecting short URL:", err);
		return res
			.status(500)
			.render("500", { error: "Internal Server Error" });
	}
}

async function handleGetURLAnalytics(req, res) {
	try {
		const shortId = req.params.shortid;
		const result = await URL.findOne({ shortId }).lean();

		if (!result) {
			return res
				.status(404)
				.json({ error: "Short URL not found" });
		}

		return res.json({
			totalClicks: result.visitHistory.length,
			analytics: result.visitHistory,
		});
	} catch (err) {
		console.error("❌ Error fetching analytics:", err);
		return res
			.status(500)
			.json({ error: "Internal Server Error" });
	}
}

module.exports = {
	handleGenerateNewShortURL,
	handleGetURLAnalytics,
	handleGetURLFromId,
};
