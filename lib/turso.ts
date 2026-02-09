import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || "libsql://nightstudio-turso-vercel-icfg-0vyxp162wkhvc2jdpllhcmmn.aws-us-east-1.turso.io";
const authToken = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA2Nzg0NjYsImlkIjoiODY4ODZlNGMtM2NmYy00NWQ5LTk4ZjQtNGVmMzQ3ZmU3OWQwIiwicmlkIjoiYTQ3MDhhMGEtODA0Zi00OTQxLWJhNTItZDVlNzBkYjczMmY2In0.cspnsqdMCdV-sV4ypYsCcmUclZjdeTzURXhuWNEmAeg5Je4ElBbcHQ-2m0c10T-U_IdNnEs0-yu4ZVnZqUSvCA";

export const turso = createClient({
    url,
    authToken,
});
