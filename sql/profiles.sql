DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
    id SERIAL primary key,
    age INT,
    city VARCHAR(100),
    website VARCHAR(300),
    user_id INT REFERENCES users(id) not null unique
);
