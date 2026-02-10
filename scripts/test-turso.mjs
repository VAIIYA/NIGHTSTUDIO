
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const url = "libsql://nightstudio-turso-vercel-icfg-0vyxp162wkhvc2jdpllhcmmn.aws-us-east-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA2Nzg0NjYsImlkIjoiODY4ODZlNGMtM2NmYy00NWQ5LTk4ZjQtNGVmMzQ3ZmU3OWQwIiwicmlkIjoiYTQ3MDhhMGEtODA0Zi00OTQxLWJhNTItZDVlNzBkYjczMmY2In0.cspnsqdMCdV-sV4ypYsCcmUclZjdeTzURXhuWNEmAeg5Je4ElBbcHQ-2m0c10T-U_IdNnEs0-yu4ZVnZqUSvCA";

async function main() {
    const turso = createClient({ url, authToken });
    try {
        console.log("Checking tables...");
        const result = await turso.execute("SELECT name FROM sqlite_master WHERE type='table';");
        console.log("Tables:", result.rows);
    } catch (e) {
        console.error("Connection failed:", e);
    }
}

main();
