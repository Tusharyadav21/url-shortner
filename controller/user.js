import URL from "../models/user.js";
import { setUser } from "../services/auth.js";

export async function handleUserSignup(req, res) {
	try {
		const { name, email, password } = req.body;

		const existingUser = await URL.findOne({ email });
		if (existingUser) {
			return res.render("signup", {
				error: "Email is already registered",
			});
		}

		const user = await URL.create({
			name,
			email,
			password,
		});

		const token = setUser(user.publicProfile);
		res.cookie("token", token, {
			httpOnly: true,
			secure: true,
			sameSite: "Strict",
		});

		console.log("User signed up:", user.publicProfile);

		return res.redirect("/");
	} catch (err) {
		console.error("❌ Signup Error:", err);
		return res
			.status(500)
			.render("signup", { error: "Internal Server Error" });
	}
}

export async function handleUserLogin(req, res) {
	try {
		const { email, password } = req.body;

		const user = await URL.findOne({ email }).select(
			"+password"
		);
		if (!user) {
			return res.render("login", {
				error: "Invalid Email or Password",
			});
		}

		// Check if account is locked
		if (user.isLocked) {
			const unlockTime = new Date(
				user.lockUntil
			).toLocaleTimeString();
			return res.render("login", {
				error: `Account locked due to multiple failed attempts. Try again after ${unlockTime}.`,
			});
		}

		// Validate password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			await user.incrementLoginAttempts();
			return res.render("login", {
				error: "Invalid Email or Password",
			});
		}

		// Reset attempts on success
		await user.resetLoginAttempts();
		await user.updateLastLogin();

		// Generate JWT token
		const token = setUser(user.publicProfile);
		res.cookie("token", token, {
			httpOnly: true,
			secure: true,
			sameSite: "Strict",
		});

		console.log("User logged in:", user.publicProfile);
		return res.redirect("/");
	} catch (err) {
		console.error("❌ Login Error:", err);
		return res
			.status(500)
			.render("login", { error: "Internal Server Error" });
	}
}
