import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditFieldsToDynamicQueries1746120000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE dynamic_queries
            ADD COLUMN deleted_at TIMESTAMP,
            ADD COLUMN created_by VARCHAR,
            ADD COLUMN updated_by VARCHAR
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE dynamic_queries
            DROP COLUMN deleted_at,
            DROP COLUMN created_by,
            DROP COLUMN updated_by
        `);
    }
} 