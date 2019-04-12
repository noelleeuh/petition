DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL primary key,
    firstName VARCHAR(50) not null,
    surname VARCHAR(100) not null,
    email VARCHAR(200) not null unique,
    password VARCHAR(100) not null
);
