import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedAdminUser1746120000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        
        await queryRunner.query(`
            INSERT INTO tbl_users (
                id,
                email,
                username,
                password,
                phone_number,
                identity_number,
                role,
                "isActive",
                created_at,
                updated_at,
                created_by,
                updated_by
            ) VALUES (
                uuid_generate_v4(),
                'admin@example.com',
                'admin',
                '${hashedPassword}',
                '0123456789',
                '123456789012',
                'ADMIN',
                true,
                now(),
                now(),
                'system',
                'system'
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM tbl_users 
            WHERE email = 'admin@example.com'
        `);
    }
} 