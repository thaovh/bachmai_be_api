import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDynamicQueriesTable1746114271191 implements MigrationInterface {
    name = 'CreateDynamicQueriesTable1746114271191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "dynamic_queries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "sql" text NOT NULL,
                "params_schema" text,
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_d0a86d5ab47276489e409c0e7ac" UNIQUE ("name"),
                CONSTRAINT "PK_3841d6cc0e80469b3f0a21379d5" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "dynamic_queries"
        `);
    }

}
