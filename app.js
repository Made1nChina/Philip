const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mustacheExpress = require("mustache-express");
const sessions = require("express-session");
const multer = require("multer");
const { Pool } = require("pg");

// Import routers
const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const dashboardRouter = require("./routes/dashboard");
const usersRouter = require("./routes/users");

// Import models
const Login = require("./model/login");

// Initialize the app
const app = express();

// Database pool setup
const pool = new Pool({
    host: "dpg-cu2en5t6l47c73c21l10-a.frankfurt-postgres.render.com",
    user: "carblog",
    password: "zV0ATeBdiYNcbQZKPWvTnhoq21QGt59z",
    database: "carblog_db_2oh0",
    port: 5432,
    ssl: {
        rejectUnauthorized: false, // Disable strict certificate validation
    },
});

// Multer setup for file uploads
const upload = multer({ dest: "/public/uploads" });

// Set up the view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "mustache");
app.engine("mustache", mustacheExpress());

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configure session middleware
app.use(
    sessions({
        secret: "thisismysecrctekeyfhrgfgrfrty84fwir767", // Use a secure secret in production
        saveUninitialized: true,
        resave: false,
        cookie: { maxAge: 86400000, secure: false }, // 1-day expiry
    })
);

// Attach shared resources to requests
app.use((req, res, next) => {
    req.pool = pool; // Attach the database pool
    req.login = new Login("users", ["username", "password"], pool); // Attach the Login instance
    req.upload = upload; // Attach Multer for file uploads
    next();
});

// Mount routers
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/dashboard", dashboardRouter);
app.use("/users", usersRouter);

// Error handling for 404
app.use((req, res, next) => {
    res.status(404).render("error", { message: "Page Not Found" });
});

// Error handling for other errors
app.use((err, req, res, next) => {
    console.error("Error stack:", err.stack);
    res.status(err.status || 500).render("error", { message: "Internal Server Error" });
});
app.use(express.static(path.join(__dirname, 'public')));

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// Export the app
module.exports = app;

