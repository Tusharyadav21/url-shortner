const mongoose = require("mongoose");

async function connectToDatabase() {
	return await mongoose.connect(
		`${process.env.MONGODB_URI}`
	);
}

module.exports = connectToDatabase;
