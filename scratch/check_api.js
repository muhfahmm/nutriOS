async function main() {
  const url = 'http://127.0.0.1:3000/api/pola-makan/guest';
  console.log(`Fetching from: ${url}`);
  const response = await fetch(url);
  const body = await response.json();
  console.log('Response Body:', body);
}

main().catch(console.error);
