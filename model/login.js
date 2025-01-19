class Login {
    constructor(table, columns, pool) {
        this.table = table;
        this.columns = columns;
        this.usernameColumn = columns[0];
        this.passwordColumn = columns[1];
        this.pool = pool;
    }


    async loginUser(req) {
        try {
            const username = req.body[this.usernameColumn];
            const password = req.body[this.passwordColumn];

            // Log
            console.log("Attempting login for username:", username);

            // Query
            const users = await this.pool.query(
                `SELECT *
                 FROM ${this.table}
                 WHERE ${this.usernameColumn} = $1`,
                [username],
            );

            if (users.rows.length < 1) {
                console.error("Login failed: user not found");
                return false; // User not found
            }

            const user = users.rows[0];
            console.log("User retrieved from database:", user);

            // passwords
            if (password === user[this.passwordColumn]) {
                req.session.userid = user.id.toString();
                console.log("Login successful for user:", user.id);
                return user; // Successful login
            }

            console.error("Login failed: password mismatch");
            return false;
        } catch (err) {
            console.error("Error in loginUser:", err);
            throw err; // err
        }
    }
}

module.exports = Login;