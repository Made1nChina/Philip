CREATE TABLE blog (
                       id SERIAL PRIMARY KEY,
                       user_id INT NOT NULL,
                       title TEXT NOT NULL,
                       short_text TEXT NOT NULL,
                       long_text TEXT,
                       preview_image TEXT,
                       create_date TIMESTAMP DEFAULT NOW(),
                       FOREIGN KEY (user_id) REFERENCES users (id)
);
create table register (
                      id SERIAL PRIMARY KEY,
                      first_name varchar(256) not null,
                      last_name varchar(256) not null,
                      password varchar(32) not null,
                      username varchar(256) not null
);
create table users(
                      id SERIAL PRIMARY KEY,
                      first_name varchar(256) not null,
                      last_name varchar(256) not null,
                      password varchar(32) not null,
                      username varchar(256) not null
)