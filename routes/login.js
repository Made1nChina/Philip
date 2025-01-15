var express = require("express");
var router = express.Router();

/* Render login page */
router.get("/", (req, res) => {
    res.render("login"); // Render the login view
});

/* Handle login */
router.post("/", async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).send("username and password are required.");
    }

    try {
        // Check user credentials
        const user = await req.login.loginUser(req);

        if (!user) {
            // Redirect to login page if authentication fails
            return res.redirect("/login");
        }

        // Redirect to dashboard or homepage on success
        res.redirect("/");
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
