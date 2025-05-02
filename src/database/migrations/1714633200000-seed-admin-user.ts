import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedAdminUser1714633200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        
        await queryRunner.query(`
            INSERT INTO tbl_users (
                id,
                email,
                username,
                password,
                phone_number,
                identity_number,
                role,
                is_active,
                created_at,
                updated_at,
                created_by,
                updated_by
            ) VALUES (
                uuid_generate_v4(),
                'fast_api@bachmai.gov.vn',
                'fast_api',
                '${hashedPassword}',
                '1123456789',
                '223456789012',
                'ADMIN',
                true,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                'system',
                'system'
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM tbl_users 
            WHERE email = 'fast_api@bachmai.gov.vn'
        `);
    }
} 