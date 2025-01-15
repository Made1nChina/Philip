class Login {
    constructor(table, columns, pool) {
        this.table = table;
        this.columns = columns;
        this.usernameColumn = columns[0];
        this.passwordColumn = columns[1];
        this.pool = pool;
    }

    async registerUser(req) {
        const values = this.columns.map((c) => {
            return req.body[c];
        });

        const placeholders = [];
        for (let i = 0; i < this.columns.length; i++) {
            placeholders.push(`$${i + 1}`);
        }

        const result = await this.pool.query(
            `INSERT INTO ${this.table} (${this.columns.join(
                    ", "
            )}) VALUES (${placeholders.join(", ")}) RETURNING id`,
            values,
        );
        const users = await this.pool.query(
            `SELECT * FROM ${this.table} WHERE id = $1`,
            [result.rows[0].id],
        );
        return users.rows;
    }

    async loggedInUser(req) {
        if (!req.session.userid) {
            return false;
        }
        const users = await this.pool.query(
            `SELECT * FROM ${this.table} WHERE id = $1`,
            [req.session.userid],
        );
        if (users.rows.length < 1) {
            return false;
        }
        return users.rows[0];
    }

    async loginUser(req) {
        try {
            const username = req.body[this.usernameColumn];
            const password = req.body[this.passwordColumn];

            // Log the input values for debugging
            console.log("Attempting login for username:", username);

            // Query the database for the user
            const users = await this.pool.query(
                `SELECT * FROM ${this.table} WHERE ${this.usernameColumn} = $1`,
                [username],
            );

            if (users.rows.length < 1) {
                console.error("Login failed: user not found");
                return false; // User not found
            }

            const user = users.rows[0];
            console.log("User retrieved from database:", user);

            // Compare plain passwords
            if (password === user[this.passwordColumn]) {
                req.session.userid = user.id.toString();
                console.log("Login successful for user:", user.id);
                return user; // Successful login
            }

            console.error("Login failed: password mismatch");
            return false; // Password mismatch
        } catch (err) {
            console.error("Error in loginUser:", err);
            throw err; // Re-throw the error for higher-level handling
        }
    }
}
module.exports = Login;