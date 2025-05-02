import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogTable1746111837874 implements MigrationInterface {
    name = 'CreateAuditLogTable1746111837874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "audit_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid,
                "action" character varying(100) NOT NULL,
                "resource" character varying(100) NOT NULL,
                "old_value" jsonb,
                "new_value" jsonb,
                "ip" character varying(45),
                "user_agent" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying,
                "updated_by" character varying,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "audit_log"
        `);
    }

}
