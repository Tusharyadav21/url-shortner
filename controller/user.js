// const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const { setUser } = require("../services/auth");

async function handleUserSignup(req, res) {
	const { name, email, password } = req.body;
	const user = await User.create({ name, email, password });
	const token = setUser(user);
	res.cookie("token", token);
	return res.redirect("/");
	// return res.status(201).render("home");
}
async function handleUserLogin(req, res) {
	const { email, password } = req.body;
	const user = await User.findOne({ email, password });
	if (!user)
		return res.render("login", {
			error: "Invalid Email or Password",
		});

	// const sessionId = uuidv4();
	const token = setUser(user);
	res.cookie("token", token);
	return res.redirect("/");
	// return res.render("home");
}

module.exports = {
	handleUserSignup,
	handleUserLogin,
};
