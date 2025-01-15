var express = require('express');
const multer = require("multer");
const bcrypt = require("bcrypt");
var router = express.Router();

const upload = multer({ dest: "public/uploads/" });

router.get("/register", (req, res) => {
    res.render("register");
});

/* redirect to register if the password is wrong and redirect to site if right */
router.post("/", async (req, res) => {
    const { username, password, first_name, last_name } = req.body;

    // Basic validation
    if (!username || !password || !first_name || !last_name) {
        return res.status(400).send("All fields are required.");
    }

    try {
        // Insert user into the database
        const query = `
            INSERT INTO users (username, password, first_name, last_name)
            VALUES ($1, $2, $3, $4)
        `;
        await req.pool.query(query, [username, password, first_name, last_name]);

        // Redirect to login page after successful registration
        res.redirect("/login");
    } catch (err) {
        console.error("Database error:", err);

        // Handle unique constraint error (e.g., duplicate usernames)
        if (err.code === "23505") {
            return res.status(400).send("Username already exists.");
        }

        res.status(500).send("Internal Server Error");
    }
});
/* Register */
router.get("/register", (req, res) => {
    res.render("register");
});
router.get('/', (req, res) => {
    console.log('GET /register route hit');
    res.render('register');
});


module.exports = router;