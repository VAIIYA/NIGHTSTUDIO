import { turso } from '../lib/turso';
import fs from 'fs';
import path from 'path';

async function main() {
    const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon to get individual statements, filtering out empty ones
    const statements = schema
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    console.log(`Executing ${statements.length} statements...`);

    for (const statement of statements) {
        try {
            await turso.execute(statement);
            console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (e) {
            console.error('Error executing statement:', e);
            console.error('Statement:', statement);
        }
    }

    console.log('Database initialization complete.');
}

main().catch(console.error);
