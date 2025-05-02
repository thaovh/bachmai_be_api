import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDynamicQueries1746119999999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      INSERT INTO dynamic_queries (id, name, sql, params_schema, description, created_at, updated_at)
      VALUES (
        uuid_generate_v4(),
        'getDepartment',
        'SELECT ID, Name FROM DEPARTMENT WHERE ID = :ID',
        '[{"name":"ID","type":"number","required":true}]',
        'Lấy thông tin phòng ban theo ID',
        now(),
        now()
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DELETE FROM dynamic_queries WHERE name = 'getDepartment'
    `);
    }
} 