var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  let users = [];
  const user = await req.login.loggedInUser(req);
  if (!user) {
    // <--
    res.redirect("/"); // <--
    return; // <--
  }
  try {
    const conn = await req.pool.getConnection(); // Verwende den Pool aus der Anfrage
    users = await conn.query("SELECT * FROM users");
    conn.release(); // Gib die Verbindung zurück in den Pool
  } catch (err) {
    console.error("Fehler bei der Datenbankabfrage:", err);
    return next(err); // Leite den Fehler an den Error-Handler weiter
  }

  res.render('index',
      { title: 'Welcome', heading: 'Hello, Mustache!', message: 'This is a Mustache template.', users: users });
});

module.exports = router;
