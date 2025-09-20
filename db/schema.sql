CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('farmer','controller')),
  region TEXT,
  preferred_language TEXT
);

CREATE TABLE farms (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES users(id),
  location GEOGRAPHY(Point, 4326),
  soil_type TEXT,
  size_acres NUMERIC
);

CREATE TABLE krishi_kendras (
  id SERIAL PRIMARY KEY,
  name TEXT,
  location GEOGRAPHY(Point, 4326),
  services TEXT
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  farmer_id INT REFERENCES users(id),
  product TEXT,
  quantity INT,
  govt_price NUMERIC,
  status TEXT
);

CREATE TABLE market_prices (
  id SERIAL PRIMARY KEY,
  crop_name TEXT,
  current_price NUMERIC,
  predicted_price NUMERIC,
  region TEXT,
  updated_at TIMESTAMP DEFAULT now()
);
