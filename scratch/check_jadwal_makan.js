const mysql = require('mysql2/promise');
const fs = require('fs');

function getXamppMysqlPort() {
  try {
    const iniContent = fs.readFileSync('C:\\xampp\\mysql\\bin\\my.ini', 'utf-8');
    const portMatch = iniContent.match(/^port\s*=\s*(\d+)/m);
    if (portMatch) return parseInt(portMatch[1], 10);
  } catch (e) {
    // Fallback
  }
  return 3306;
}

async function main() {
  const port = getXamppMysqlPort();
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    port: port,
    database: 'db_nutrios'
  });

  console.log('Querying jadwal_makan table...');
  const [rows] = await connection.query('SELECT * FROM jadwal_makan;');
  console.log('Table Rows:', rows);
  await connection.end();
}

main().catch(console.error);
