const bcrypt = require('bcrypt');

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

        // overwrite password with hashed password
        values[1] = await bcrypt.hash(req.body[this.passwordColumn], 10);

        const placeholders = [];
        for (let i = 0; i < this.columns.length; i++) {
            placeholders.push(`$${i + 1}`);
            //placeholders.push(`?`);
        }

        const result = await this.pool.query(
            `INSERT INTO ${this.table} (${this.columns.join(
                ", ",
            )}) VALUES (${placeholders.join(", ")}) RETURNING id`,
            values,
        );
        const users = await this.pool.query(
            `SELECT * FROM ${this.table} WHERE id = $1`,
            [result.id],
        );
        return users;
    }

    async loggedInUser(req) {
        if (!req.session.userid) {
            return false;
        }
        const users = await this.pool.query(
            `SELECT * FROM ${this.table} WHERE id = $1`,
            [req.session.userid],
        );
        if (users.length < 1) {
            return false;
        }
        return users;
    }

    async loginUser(req) {
        const username = req.body[this.usernameColumn];
        const password = req.body[this.passwordColumn];
        const users = await this.pool.query(
            `SELECT * FROM ${this.table} WHERE ${this.usernameColumn} = $1`,
            [username],
        );
        if (users.length < 1) {
            return false;
        }
        const user = users.rows[0];
        console.log(user);
        const correct = await bcrypt.compare(password, user[this.passwordColumn]);
        if (correct) {
            req.session.userid = user.id.toString();
            return user;
        }
        return false;
    }
}

module.exports = {
    Login: Login
}
