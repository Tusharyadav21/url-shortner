const jwt = require("jsonwebtoken");
require("dotenv").config();

const key = process.env.SECRET_KEY;

/**
 * ✅ Generate JWT for a user
 * Includes expiration & secure claims.
 */
function setUser(user) {
	return jwt.sign(
		{
			_id: user.id,
			email: user.email,
			role: user.role,
			name: user.name,
		},
		key,
		{ expiresIn: "1h" } // ✅ Token expires in 1 hour (adjust as needed)
	);
}

/**
 * ✅ Verify JWT safely
 * Returns user payload or null if invalid/expired.
 */
function getUser(token) {
	if (!token) return null;

	try {
		return jwt.verify(token, key);
	} catch (err) {
		if (err.name === "TokenExpiredError") {
			console.warn(
				"⚠️ JWT expired. User needs to log in again."
			);
		} else if (err.name === "JsonWebTokenError") {
			console.warn("⚠️ Invalid JWT detected.");
		} else {
			console.error(
				"❌ JWT verification failed:",
				err.message
			);
		}
		return null;
	}
}

module.exports = {
	setUser,
	getUser,
};
