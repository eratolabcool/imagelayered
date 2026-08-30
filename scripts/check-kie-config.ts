import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config({ path: '.env.development' });

async function main() {
  const c = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const r = await c.execute(
    "select name, value from config where name like '%kie%' or name like '%layer_decomposition%' or name like '%fal%'"
  );
  for (const row of r.rows) {
    const v = String(row.value);
    console.log(row.name, '=', v.length > 16 ? v.slice(0, 10) + `...(${v.length})` : v);
  }
  if (r.rows.length === 0) console.log('(no rows)');
}

main();
