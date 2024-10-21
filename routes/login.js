var express = require('express');
const multer = require("multer");
const bcrypt = require("bcrypt");
var router = express.Router();

const upload = multer({ dest: "public/uploads/" });

/* Login */
router.get("/", (req, res) => {
    res.render("login");
});

/* redirect to login if the password is wrong and redirect to site if right */
router.post("/login", upload.none(), async (req, res) => {

    const user = await req.login.loginUser(req);

    if (!user) {
        res.redirect("/");
        return;
    } else {
        res.redirect("/dashboard");
        return;
    }
});

/* Register */
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", upload.none(), async (req, res) => {
    const user = await req.login.registerUser(req);

    if (user) {
        res.redirect("/");
        return;
    } else {
        res.redirect("/register");
        return;
    }
});

module.exports = router;