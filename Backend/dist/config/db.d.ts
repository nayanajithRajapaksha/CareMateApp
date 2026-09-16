import { Pool } from 'pg';
declare const pool: Pool;
export declare const clientQuery: (text: string, params: any[]) => Promise<import("pg").QueryResult<any>>;
export default pool;
//# sourceMappingURL=db.d.ts.map