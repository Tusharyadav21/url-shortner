const mongoose = require("mongoose");

async function connectToDatabase() {
	return await mongoose.connect(
		`mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.z03af3o.mongodb.net/?retryWrites=true&w=majority`
	);
}

module.exports = connectToDatabase;
