var express = require('express');
const multer = require("multer");
const bcrypt = require("bcrypt");
var router = express.Router();

const upload = multer({ dest: "public/uploads/" });

/* register */
router.get("/", (req, res) => {
    res.render("register");
});

/* redirect to register if the password is wrong and redirect to site if right */
router.post("/", async (req, res) => {
    const { username, password, first_name, last_name } = req.body;

    // Grundlegende Validierung
    if (!password) {
        return res.status(400).send("Missing password");
    }

    try {
        // Benutzer in die Datenbank einfügen (mit vereinfachter SQL-Abfrage)
        const query = `
            INSERT INTO users (username, password, first_name, last_name)
            VALUES (1$, 1$, 1$, 1$)
        `;
        await req.pool.query(query, [username, password, first_name, last_name]);

        // Weiterleitung nach erfolgreicher Registrierung
        res.redirect("/"); // Leitet zu einer existierenden Seite weiter
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Internal Server Error");
    }
});

/* Register */
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", upload.none(), async (req, res) => {
    const user = await req.register.registerUser(req);

    if (user) {
        res.redirect("/");
        return;
    } else {
        res.redirect("/register");
        return;
    }
});

module.exports = router;