const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'zyra',    
  password: 'VIZY_052582',
  port: 5432,
});

module.exports = pool;