declare module 'oracledb' {
    export interface Pool {
        getConnection(...args: any[]): Promise<Connection>;
        close(...args: any[]): Promise<void>;
    }

    export interface Connection {
        execute(...args: any[]): Promise<any>;
        close(...args: any[]): Promise<void>;
    }

    export function createPool(...args: any[]): Promise<Pool>;

    export const OUT_FORMAT_OBJECT: number;
} 