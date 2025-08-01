const { getUser } = require("../services/auth");
require("dotenv").config();

/**
 * Authentication Middleware
 * Supports:
 * - Cookie-based auth (Web)
 * - Bearer Token in Authorization header (Mobile/SPA)
 */
function checkForAuthentication(req, res, next) {
	try {
		let token = null;

		// Prefer Authorization header (for API/Mobile clients)
		const authHeader = req.headers["authorization"];
		if (authHeader && authHeader.startsWith("Bearer ")) {
			token = authHeader.split("Bearer ")[1];
		} else if (req.cookies?.token) {
			// Fallback to cookie for web sessions
			token = req.cookies.token;
		}

		req.user = null;

		if (!token) {
			// No token? Proceed as unauthenticated (guest)
			return next();
		}

		// Verify token safely
		const user = getUser(token);
		if (!user) {
			console.warn("⚠️ Invalid or expired token detected.");
			return next();
		}

		req.user = user; // Attach user to request object
		return next();
	} catch (err) {
		console.error("❌ Authentication error:", err.message);
		req.user = null;
		return next(); // Don't block request, just treat as guest
	}
}

/**
 * Authorization Middleware
 * Restricts access based on user roles
 * @param {string[]} roles - Array of allowed roles e.g. ["ADMIN", "USER"]
 */
function restrictTo(roles = []) {
	return (req, res, next) => {
		try {
			if (!req.user) {
				console.warn(
					"⚠️ Unauthorized access attempt. Redirecting to /login."
				);
				return res.redirect("/login");
			}

			if (!roles.includes(req.user.role)) {
				console.warn(
					`🚫 Access denied for user ${req.user.email}. Role: ${req.user.role}`
				);
				return res.status(403).render("403", {
					error:
						"Forbidden: You don't have permission to access this resource",
				});
			}

			return next();
		} catch (err) {
			console.error("❌ Authorization error:", err.message);
			return res
				.status(500)
				.render("500", { error: "Internal Server Error" });
		}
	};
}

module.exports = {
	checkForAuthentication,
	restrictTo,
};
