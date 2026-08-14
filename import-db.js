const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

function getXamppMysqlPort() {
  const defaultPort = 3306;
  const myIniPath = 'C:\\xampp\\mysql\\bin\\my.ini';
  try {
    if (fs.existsSync(myIniPath)) {
      const content = fs.readFileSync(myIniPath, 'utf8');
      const lines = content.split('\n');
      let inMysqld = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('[mysqld]')) {
          inMysqld = true;
          continue;
        } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          inMysqld = false;
        }
        if (inMysqld) {
          const match = trimmed.match(/^port\s*=\s*(\d+)/i);
          if (match) {
            return parseInt(match[1], 10);
          }
        }
      }
      const generalMatch = content.match(/^\s*port\s*=\s*(\d+)/m);
      if (generalMatch) {
        return parseInt(generalMatch[1], 10);
      }
    }
  } catch (err) {
    console.warn('⚠️ Gagal membaca port MySQL dari XAMPP my.ini:', err.message);
  }
  return defaultPort;
}

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : getXamppMysqlPort(),
};

async function importDatabase() {
  console.log('📖 Reading database.sql...');
  const sqlFile = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

  const lines = sqlFile.split('\n');
  let cleanedSql = '';
  for (let line of lines) {

    if (line.trim().startsWith('--') || line.trim().startsWith('#')) {
      continue;
    }
    cleanedSql += line + '\n';
  }

  const statements = cleanedSql
    .split(';')
    .map(st => st.trim())
    .filter(st => st.length > 0);

  console.log(`🔌 Connecting to MySQL server at ${dbConfig.host}:${dbConfig.port}...`);
  const connection = await mysql.createConnection(dbConfig);
  console.log('✅ Connected to MySQL!');

  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      const preview = statement.split('\n')[0].substring(0, 80);
      console.log(`⏳ Executing [${i+1}/${statements.length}]: ${preview}...`);
      await connection.query(statement);
    }
    console.log('\n🎉 DATABASE SCHEMA SUCCESSFULLY CREATED/UPDATED!');
  } catch (error) {
    console.error('\n❌ Error executing SQL statement:', error.message);
    console.error('Statement was:', error.sql || 'Unknown');
  } finally {
    await connection.end();
  }
}

importDatabase().catch(err => {
  console.error('Fatal Error:', err);
});
