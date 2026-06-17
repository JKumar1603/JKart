CREATE DATABASE IF NOT EXISTS ecomdb;
USE ecomdb;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  price DOUBLE NOT NULL,
  quantity INT NOT NULL,
  vendor VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  category VARCHAR(255) NOT NULL,
  image_url VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  customer_email VARCHAR(255),
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  total_amount DOUBLE,
  order_status VARCHAR(50),
  payment_status VARCHAR(50)
);

INSERT INTO products (name, description, price, quantity, vendor, status, category, image_url)
SELECT
  'Dell Inspiron Laptop',
  'Powerful laptop with Intel processor, 16GB RAM and SSD storage',
  62000,
  15,
  'JK Electronics',
  'APPROVED',
  'Electronics',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80'
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Dell Inspiron Laptop'
);

SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM orders;
SELECT id, name, category, status FROM products;
SELECT DISTINCT category FROM products;
