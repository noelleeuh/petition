DROP TABLE IF EXISTS signers;

CREATE TABLE signers (
    id SERIAL primary key,
    signature TEXT not null,
    users_id INT REFERENCES users(id) not null unique
);
