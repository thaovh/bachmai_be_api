import { Injectable, OnModuleInit } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Injectable()
export class OracleService implements OnModuleInit {
    private pool: oracledb.Pool;

    async onModuleInit() {
        const connectString = `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`;
        this.pool = await oracledb.createPool({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString,
        });
    }

    async executeQuery(sql: string, params?: any): Promise<any[]> {
        const conn = await this.pool.getConnection();
        try {
            const result = await conn.execute(sql, params || {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
            return result.rows;
        } finally {
            await conn.close();
        }
    }
} 