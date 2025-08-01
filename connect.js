const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function connectToDatabase() {
	let attempts = 0;

	const connect = async () => {
		try {
			await mongoose.connect(process.env.MONGODB_URI, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				maxPoolSize: 20, // Connection pooling
				serverSelectionTimeoutMS: 5000, // Fail fast if DB is down
				socketTimeoutMS: 45000, // Close idle sockets
				family: 4, // Force IPv4 for consistency
			});

			console.log(
				`MongoDB connected: ${mongoose.connection.host}`
			);
		} catch (err) {
			attempts++;
			console.error(
				`❌ MongoDB connection failed (Attempt ${attempts}/${MAX_RETRIES}):`,
				err.message
			);

			if (attempts < MAX_RETRIES) {
				console.log(
					`🔄 Retrying in ${RETRY_DELAY / 1000} seconds...`
				);
				await new Promise((res) =>
					setTimeout(res, RETRY_DELAY)
				);
				return connect();
			} else {
				console.error("🚨 Max retries reached. Exiting...");
				process.exit(1); // Exit if DB is unreachable after retries
			}
		}
	};

	await connect();

	// Handle unexpected disconnections
	mongoose.connection.on("disconnected", () => {
		console.warn(
			"⚠️ MongoDB disconnected! Attempting reconnect..."
		);
		connect();
	});

	// Log connection errors
	mongoose.connection.on("error", (err) => {
		console.error("❌ MongoDB error:", err);
	});

	// Graceful shutdown on process exit
	process.on("SIGINT", async () => {
		console.log("🔻 Closing MongoDB connection...");
		await mongoose.connection.close();
		process.exit(0);
	});

	return mongoose.connection;
}

module.exports = connectToDatabase;
