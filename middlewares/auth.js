const { getUser } = require("../services/auth");

// Authentication
function checkForAuthentication(req, res, next) {
	// For Mobile Application : use the below functionality to check
	// const authorizationHeaderValue = req.headers["authorization"];
	// if (!authorizationHeaderValue || authorizationHeaderValue.startswith("Bearer ")) return next();
	// const token = authorizationHeaderValue.split("Bearer ")[1];

	const tokenCookie = req.cookies?.token;
	req.user = null;

	if (!tokenCookie) return next();

	const token = tokenCookie;
	const user = getUser(token);

	req.user = user;
	next();
}

// Authorization
function restrictTo(roles) {
	return function (req, res, next) {
		if (!req.user) return res.redirect("/login");

		if (!roles.includes(req.user.role)) return res.end("UnAuthorized");

		return next();
	};
}

module.exports = {
	checkForAuthentication,
	restrictTo,
};
