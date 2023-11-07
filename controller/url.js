const shortid = require("shortid");
const URL = require("../models/url");

async function handleGenerateNewShortURL(req, res) {
	const body = req.body;

	if (!body.url) return res.status(404).json({ error: "URL Required" });

	const shortId = shortid();

	await URL.create({
		shortId: shortId,
		redirectedUrl: body.url,
		visitHistory: [],
	});

	// return res.status(200).json({ id: shortId });
	return res.render("home", {
		id: shortId,
	});
}

async function handleGetURLFromId(req, res) {
	const shortId = req.params.shortid || req.params.id;
	const entry = await URL.findOneAndUpdate(
		{
			shortId,
		},
		{
			$push: {
				visitHistory: { timestamp: Date.now() },
			},
		}
	);

	res.redirect(entry.redirectedUrl);
}

async function handleGetURLAnalytics(req, res) {
	const shortId = req.params.shortid;
	const result = await URL.findOne({ shortId });
	return res.json({ totalClicks: result.visitHistory.length, analytics: result.visitHistory });
}

module.exports = {
	handleGenerateNewShortURL,
	handleGetURLAnalytics,
	handleGetURLFromId,
};
