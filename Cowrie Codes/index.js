require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

/**
 * GET /api/events
 * Latest 100 rows from cowrie_json_sessions ordered by timestamp DESC
 */
app.get('/api/events', async (req, res) => {
  try {
    const q = `
      SELECT *
      FROM cowrie_json_sessions
      WHERE src_ip IS NOT NULL OR TRUE
      ORDER BY timestamp DESC
      LIMIT 100
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/events error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /api/reports
 * Latest 100 rows from report where shodan_raw, abuse_score and ipinfo_raw are NOT NULL
 */
app.get('/api/reports', async (req, res) => {
  try {
    const q = `
      SELECT *
      FROM report
      WHERE shodan_lat IS NOT NULL
        AND abuse_score IS NOT NULL
        AND city IS NOT NULL
      ORDER BY updated_at DESC
      LIMIT 100
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/reports error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /api/sessions
 * Latest 100 unique sessions (by src_ip, ordered by timestamp DESC)
 * Returns session, src_ip, and timestamp
 */
app.get('/api/sessions', async (req, res) => {
  try {
    const q = `
      SELECT session, src_ip, timestamp
      FROM (
        SELECT DISTINCT ON (src_ip)
          session, src_ip, timestamp
        FROM cowrie_json_sessions
        WHERE session IS NOT NULL
          AND src_ip IS NOT NULL
        ORDER BY src_ip, timestamp DESC
      ) t
      ORDER BY timestamp DESC
      LIMIT 1000
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/sessions error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /api/summaries
 * Latest 100 rows from summaries showing src_ip, purpose, summary, duration, and severity
 */

app.get('/api/summaries', async (req, res) => {
  try {
    const q = `
      SELECT src_ip, purpose, summary, duration_seconds, severity
      FROM summaries
      ORDER BY start DESC
      LIMIT 100
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/summaries error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
