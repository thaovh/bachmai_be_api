import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAllTables1746107497253 implements MigrationInterface {
    name = 'CreateAllTables1746107497253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tbl_users_role_enum" AS ENUM('ADMIN', 'USER')`);
        await queryRunner.query(`CREATE TABLE "tbl_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" character varying, "updated_by" character varying, "email" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "phone_number" character varying(10) NOT NULL, "identity_number" character varying(12) NOT NULL, "role" "public"."tbl_users_role_enum" NOT NULL DEFAULT 'USER', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_d74ab662f9d3964f78b3416d5da" UNIQUE ("email"), CONSTRAINT "UQ_22e9c745c648bad6b39c5d5b58e" UNIQUE ("username"), CONSTRAINT "UQ_44590c20eaaf69d9254bc0751cc" UNIQUE ("phone_number"), CONSTRAINT "UQ_7b6b73c44d34ea43a610968c08c" UNIQUE ("identity_number"), CONSTRAINT "PK_bb1d884179b3e42514b36c01e4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tbl_refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" character varying, "updated_by" character varying, "user_id" uuid NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_80ecf9d3d7a1af92c155d9e412b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tbl_refresh_tokens" ADD CONSTRAINT "FK_cdc9043779337a9447b5f93f0cb" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tbl_refresh_tokens" DROP CONSTRAINT "FK_cdc9043779337a9447b5f93f0cb"`);
        await queryRunner.query(`DROP TABLE "tbl_refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "tbl_users"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_users_role_enum"`);
    }

}
