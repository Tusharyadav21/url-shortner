import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import path, { resolve, join } from "path";
import connectToDatabase from "./connect.js";
import favicon from "serve-favicon";

// Routes
import urlRoute from "./routes/url.js";
import staticRoute from "./routes/staticRouter.js";
import userRoute from "./routes/user.js";
import {
	checkForAuthentication,
	restrictTo,
} from "./middlewares/auth.js";

import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8001;

(async () => {
	await connectToDatabase();
	app.listen(process.env.PORT, () => {
		console.log(
			`🚀 Server running on port ${process.env.PORT}`
		);
	});
})();

app.set("view engine", "ejs");
app.set("views", resolve("./views"));

// Middleware
// app.use(express.favicon('./views/favicon.ico'));
app.use(favicon(join(__dirname, "views", "favicon.ico")));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/url", restrictTo(["USER", "ADMIN"]), urlRoute);
app.use("/", staticRoute);
app.use("/user", userRoute);

app.listen(PORT, () =>
	console.log(`Server Started at PORT: ${PORT}`)
);
