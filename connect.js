const mongoose = require("mongoose");

async function connectToDatabase(url) {
	return await mongoose.connect(url);
}

module.exports = connectToDatabase;
