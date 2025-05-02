import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameIsActiveColumn1746120000003 implements MigrationInterface {
    name = 'RenameIsActiveColumn1746120000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Kiểm tra xem cột isActive có tồn tại không
        const table = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tbl_users' 
            AND column_name = 'isActive'
        `);

        if (table.length > 0) {
            // Nếu cột isActive tồn tại, đổi tên thành is_active
            await queryRunner.query(`
                ALTER TABLE tbl_users 
                RENAME COLUMN "isActive" TO is_active
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Kiểm tra xem cột is_active có tồn tại không
        const table = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tbl_users' 
            AND column_name = 'is_active'
        `);

        if (table.length > 0) {
            // Nếu cột is_active tồn tại, đổi tên lại thành isActive
            await queryRunner.query(`
                ALTER TABLE tbl_users 
                RENAME COLUMN is_active TO "isActive"
            `);
        }
    }
} 