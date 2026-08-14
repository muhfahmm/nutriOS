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
  console.log(`Using MySQL Port: ${port}`);
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    port: port,
    database: 'db_nutrios'
  });

  console.log('Dropping log_makanan table...');
  await connection.query('DROP TABLE IF EXISTS log_makanan;');
  console.log('Table log_makanan dropped successfully!');
  await connection.end();
}

main().catch(console.error);
