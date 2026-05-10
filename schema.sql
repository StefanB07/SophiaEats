CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    credit DECIMAL(10, 2) DEFAULT 0.0
);

CREATE TABLE restaurants (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    is_open BOOLEAN DEFAULT true
);

CREATE TABLE dishes (
    id VARCHAR(255) PRIMARY KEY,
    restaurant_id VARCHAR(255) NOT NULL REFERENCES restaurants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255)
);

CREATE TABLE dish_extras (
    id VARCHAR(255) PRIMARY KEY,
    dish_id VARCHAR(255) NOT NULL REFERENCES dishes(id),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE carts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id VARCHAR(255) PRIMARY KEY,
    cart_id VARCHAR(255) NOT NULL REFERENCES carts(id),
    dish_id VARCHAR(255) NOT NULL REFERENCES dishes(id),
    quantity INT NOT NULL
);

CREATE TABLE locations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    restaurant_id VARCHAR(255) NOT NULL REFERENCES restaurants(id),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    delivery_place_id VARCHAR(255) NOT NULL REFERENCES locations(id),
    delivery_time TIMESTAMP NOT NULL,
    total DECIMAL(10, 2) NOT NULL
);

CREATE TABLE order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(id),
    dish_id VARCHAR(255) NOT NULL REFERENCES dishes(id),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    notes TEXT
);

CREATE TABLE order_item_extras (
    order_item_id VARCHAR(255) NOT NULL REFERENCES order_items(id),
    extra_id VARCHAR(255) NOT NULL REFERENCES dish_extras(id),
    PRIMARY KEY (order_item_id, extra_id)
);

CREATE TABLE payments (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(id),
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    is_success BOOLEAN NOT NULL
);
