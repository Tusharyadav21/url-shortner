const sessionIdToUsermMap = new Map();

function setUser(id, user) {
	sessionIdToUsermMap.set(id, user);
}

function getUser(id) {
	return sessionIdToUsermMap.get(id);
}

module.exports = {
	setUser,
	getUser,
};
