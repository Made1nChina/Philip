create table blog (
                      id SERIAL PRIMARY KEY,
                      title varchar(32) not null,
                      short_text varchar(256) not null,
                      autor varchar(32),
                      long_text varchar(2048) not null,
                      create_date date default now()
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