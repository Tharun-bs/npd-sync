const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'npd_workflow',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Routes

// Get all trials
app.get('/api/trials', async (req, res) => {
  try {
    const [trials] = await pool.execute(`
      SELECT t.*, 
             COUNT(sd.id) as steps_count,
             SUM(CASE WHEN sd.validation_status = 'ok' THEN 1 ELSE 0 END) as completed_steps
      FROM trials t
      LEFT JOIN step_data sd ON t.id = sd.trial_id
      GROUP BY t.id
      ORDER BY t.updated_at DESC
    `);
    
    res.json(trials);
  } catch (error) {
    console.error('Error fetching trials:', error);
    res.status(500).json({ error: 'Failed to fetch trials' });
  }
});

// Get single trial with steps
app.get('/api/trials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get trial
    const [trials] = await pool.execute(
      'SELECT * FROM trials WHERE id = ?',
      [id]
    );
    
    if (trials.length === 0) {
      return res.status(404).json({ error: 'Trial not found' });
    }
    
    // Get steps
    const [steps] = await pool.execute(
      'SELECT * FROM step_data WHERE trial_id = ? ORDER BY step_code',
      [id]
    );
    
    const trial = {
      ...trials[0],
      steps: steps.map(step => ({
        ...step,
        data: JSON.parse(step.data_json || '{}')
      }))
    };
    
    res.json(trial);
  } catch (error) {
    console.error('Error fetching trial:', error);
    res.status(500).json({ error: 'Failed to fetch trial' });
  }
});

// Create new trial
app.post('/api/trials', async (req, res) => {
  try {
    const { trialNo, partName } = req.body;
    
    if (!trialNo || !partName) {
      return res.status(400).json({ error: 'Trial number and part name are required' });
    }
    
    // Check if trial number already exists
    const [existing] = await pool.execute(
      'SELECT id FROM trials WHERE trial_no = ?',
      [trialNo]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Trial number already exists' });
    }
    
    // Create trial
    const [result] = await pool.execute(
      'INSERT INTO trials (trial_no, part_name, status) VALUES (?, ?, ?)',
      [trialNo, partName, 'in_progress']
    );
    
    // Get created trial
    const [newTrial] = await pool.execute(
      'SELECT * FROM trials WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ ...newTrial[0], steps: [] });
  } catch (error) {
    console.error('Error creating trial:', error);
    res.status(500).json({ error: 'Failed to create trial' });
  }
});

// Update trial step
app.post('/api/trials/:id/steps/:stepCode', async (req, res) => {
  try {
    const { id, stepCode } = req.params;
    const { data, validationStatus, remarks } = req.body;
    
    if (!validationStatus || !['ok', 'not_ok', 'pending'].includes(validationStatus)) {
      return res.status(400).json({ error: 'Valid validation status is required' });
    }
    
    // Update or insert step data
    await pool.execute(`
      INSERT INTO step_data (trial_id, step_code, data_json, validation_status, remarks)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        data_json = VALUES(data_json),
        validation_status = VALUES(validation_status),
        remarks = VALUES(remarks),
        updated_at = CURRENT_TIMESTAMP
    `, [id, stepCode, JSON.stringify(data), validationStatus, remarks || null]);
    
    // Update trial status
    let newStatus = 'in_progress';
    let haltedStepCode = null;
    
    if (validationStatus === 'not_ok') {
      newStatus = 'halted';
      haltedStepCode = stepCode;
    } else {
      // Check if all steps are completed
      const [steps] = await pool.execute(
        'SELECT COUNT(*) as total, SUM(CASE WHEN validation_status = "ok" THEN 1 ELSE 0 END) as completed FROM step_data WHERE trial_id = ?',
        [id]
      );
      
      if (steps[0].total === 6 && steps[0].completed === 6) {
        newStatus = 'completed';
      }
    }
    
    await pool.execute(
      'UPDATE trials SET status = ?, halted_step_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, haltedStepCode, id]
    );
    
    res.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

// Get trial by trial number
app.get('/api/trials/by-number/:trialNo', async (req, res) => {
  try {
    const { trialNo } = req.params;
    
    const [trials] = await pool.execute(
      'SELECT * FROM trials WHERE trial_no = ?',
      [trialNo]
    );
    
    if (trials.length === 0) {
      return res.status(404).json({ error: 'Trial not found' });
    }
    
    // Get steps
    const [steps] = await pool.execute(
      'SELECT * FROM step_data WHERE trial_id = ? ORDER BY step_code',
      [trials[0].id]
    );
    
    const trial = {
      ...trials[0],
      steps: steps.map(step => ({
        ...step,
        data: JSON.parse(step.data_json || '{}')
      }))
    };
    
    res.json(trial);
  } catch (error) {
    console.error('Error fetching trial by number:', error);
    res.status(500).json({ error: 'Failed to fetch trial' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  await testConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error);