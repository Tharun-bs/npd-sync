const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

const schema = `
-- Create database
CREATE DATABASE IF NOT EXISTS npd_workflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE npd_workflow;

-- Trials table
CREATE TABLE IF NOT EXISTS trials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trial_no VARCHAR(120) NOT NULL UNIQUE,
  part_name VARCHAR(255) DEFAULT NULL,
  status ENUM('in_progress','halted','completed') DEFAULT 'in_progress',
  halted_step_code VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trial_no (trial_no),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Step data table
CREATE TABLE IF NOT EXISTS step_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trial_id INT NOT NULL,
  step_code VARCHAR(50) NOT NULL,
  data_json JSON,
  validation_status ENUM('ok','not_ok','pending') DEFAULT 'pending',
  remarks TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trial_step (trial_id, step_code),
  FOREIGN KEY (trial_id) REFERENCES trials(id) ON DELETE CASCADE,
  INDEX idx_step_code (step_code),
  INDEX idx_validation_status (validation_status)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trial_id INT NOT NULL UNIQUE,
  qr_path VARCHAR(255),
  pdf_path VARCHAR(255),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trial_id) REFERENCES trials(id) ON DELETE CASCADE
);

-- Workflow steps reference
CREATE TABLE IF NOT EXISTS workflow_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  order_index INT NOT NULL DEFAULT 0
);

-- Insert workflow steps
INSERT INTO workflow_steps (code, name, order_index) VALUES
('DPT1','Department 1 - General Details',1),
('DPT2','Department 2 - Melting',2),
('DPT3','Department 3 - Sand Properties',3),
('DPT4','Department 4 - Moulding',4),
('DPT5','Department 5 - Metallurgical Inspection',5),
('DPT6','Department 6 - Fettling & Inspection',6)
ON DUPLICATE KEY UPDATE name=VALUES(name), order_index=VALUES(order_index);
`;

async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔄 Creating database and tables...');
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created:');
    console.log('   - trials');
    console.log('   - step_data');
    console.log('   - reports');
    console.log('   - workflow_steps');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();