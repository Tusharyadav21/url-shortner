// const sessionIdToUsermMap = new Map();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const key = process.env.SECRET_KEY;

function setUser(user) {
	// sessionIdToUsermMap.set(id, user);
	return jwt.sign({ _id: user.id, email: user.email, role: user.role }, key);
}

function getUser(token) {
	if (!token) return null;
	return jwt.verify(token, key);
}

module.exports = {
	setUser,
	getUser,
};
