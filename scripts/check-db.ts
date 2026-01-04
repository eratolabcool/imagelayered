
import { db } from '../src/core/db';
import * as schema from '../src/config/db/schema';
import { envConfigs } from '../src/config';

async function check() {
  console.log('Provider:', envConfigs.database_provider);
  try {
    const configs = await db().select().from(schema.config);
    console.log('Configs:', configs);
  } catch (e: any) {
    console.error('Failed to read configs:', e.message);
  }
}

check();
