const express = require("express");
const path = require("path");
const connectToDatabase = require("./connect");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const URL = require("./models/url");

const app = express();
const PORT = 8000;

connectToDatabase("mongodb://127.0.0.1:27017/url-shortner").then(() => console.log("DB Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/url", urlRoute);
app.use("/", staticRoute);

// app.get("/test", async (req, res) => {
// 	const allUrls = await URL.find({});
// 	return res.render("home", {
// 		urls: allUrls,
// 	});
// });

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
