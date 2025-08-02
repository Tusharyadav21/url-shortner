import mongoose from "mongoose";

const { connect: _connect, connection } = mongoose;

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function connectToDatabase() {
	let attempts = 0;

	const connect = async () => {
		try {
			await _connect(process.env.MONGODB_URI, {
				maxPoolSize: 20,
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000,
				family: 4,
			});

			console.log(
				`✅ MongoDB connected: ${connection.host}`
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
				process.exit(1);
			}
		}
	};

	await connect();

	// Handle unexpected disconnections
	connection.on("disconnected", () => {
		console.warn(
			"⚠️ MongoDB disconnected! Attempting reconnect..."
		);
		connect();
	});

	// Log connection errors
	connection.on("error", (err) => {
		console.error("❌ MongoDB error:", err);
	});

	// Graceful shutdown on process exit
	process.on("SIGINT", async () => {
		console.log("🔻 Closing MongoDB connection...");
		await connection.close();
		process.exit(0);
	});

	return connection;
}

export default connectToDatabase;
