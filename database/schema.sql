-- Expense Tracker Database Schema
-- Drop existing database if exists and create new one
DROP DATABASE IF EXISTS expense_tracker;
CREATE DATABASE expense_tracker;
USE expense_tracker;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT 'default-avatar.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Expenses table
CREATE TABLE expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_user_date (user_id, date),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Expense images table
CREATE TABLE expense_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    expense_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    INDEX idx_expense (expense_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default categories
INSERT INTO categories (name, icon, color) VALUES
('Food & Dining', '🍔', '#FF6B6B'),
('Transportation', '🚗', '#4ECDC4'),
('Shopping', '🛒', '#FFE66D'),
('Entertainment', '🎬', '#A8E6CF'),
('Bills & Utilities', '📄', '#FF8B94'),
('Healthcare', '⚕️', '#C7CEEA'),
('Education', '📚', '#B4A7D6'),
('Travel', '✈️', '#FFD3B6'),
('Personal Care', '💄', '#FFAAA5'),
('Other', '📌', '#95E1D3');

-- Create demo user 
INSERT INTO users (username, email, password) VALUES
('demo', 'demo@expense.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert sample expenses
INSERT INTO expenses (user_id, amount, category_id, date, notes) VALUES
(1, 45.50, 1, '2025-12-01', 'Lunch at downtown restaurant'),
(1, 25.00, 2, '2025-12-02', 'Uber to office'),
(1, 120.00, 3, '2025-12-03', 'New headphones'),
(1, 15.00, 4, '2025-12-05', 'Movie tickets'),
(1, 85.50, 5, '2025-12-06', 'Electricity bill'),
(1, 200.00, 6, '2025-12-07', 'Doctor visit'),
(1, 50.00, 1, '2025-12-08', 'Grocery shopping'),
(1, 30.00, 2, '2025-12-09', 'Gas refill'),
(1, 75.00, 7, '2025-12-10', 'Online course');
