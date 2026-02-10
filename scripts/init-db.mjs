
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const url = "libsql://nightstudio-turso-vercel-icfg-0vyxp162wkhvc2jdpllhcmmn.aws-us-east-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA2Nzg0NjYsImlkIjoiODY4ODZlNGMtM2NmYy00NWQ5LTk4ZjQtNGVmMzQ3ZmU3OWQwIiwicmlkIjoiYTQ3MDhhMGEtODA0Zi00OTQxLWJhNTItZDVlNzBkYjczMmY2In0.cspnsqdMCdV-sV4ypYsCcmUclZjdeTzURXhuWNEmAeg5Je4ElBbcHQ-2m0c10T-U_IdNnEs0-yu4ZVnZqUSvCA";

async function main() {
    const turso = createClient({ url, authToken });
    try {
        console.log("Reading schema.sql...");
        const schema = fs.readFileSync(path.join(process.cwd(), 'sql', 'schema.sql'), 'utf8');
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Executing ${statements.length} statements...`);
        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await turso.execute(statement);
        }
        console.log("Database initialized successfully!");
    } catch (e) {
        console.error("Initialization failed:", e);
    }
}

main();
