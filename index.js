const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectToDatabase = require("./connect");
const URL = require("./models/url");

// Routes
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const { checkForAuthentication, restrictTo } = require("./middlewares/auth");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8001;

connectToDatabase().then(() => console.log("DB Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/url", restrictTo(["NORMAL", "ADMIN"]), urlRoute);
app.use("/", staticRoute);
app.use("/user", userRoute);

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
