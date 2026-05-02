import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777746303283 implements MigrationInterface {
    name = 'InitialSchema1777746303283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "pokemon" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pokeapi_id" integer NOT NULL, "name" character varying(255) NOT NULL, "sprite_url" character varying(512), "types" jsonb NOT NULL DEFAULT '[]', "base_experience" integer, "height" integer, "weight" integer, "fetched_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b503db1369f46c43f8da0a6a0a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a41ce442d4c6e998ae904fe2d3" ON "pokemon" ("pokeapi_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1cb8fc72a68e5a601312c642c8" ON "pokemon" ("name") `);
        await queryRunner.query(`CREATE TABLE "team_pokemon" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "team_id" uuid NOT NULL, "pokemon_id" uuid NOT NULL, "slot" integer NOT NULL, "nickname" character varying(255), "added_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cb354a21e6ba59bb10ac4a5a426" UNIQUE ("team_id", "slot"), CONSTRAINT "UQ_34f690acdcaff08f3a30eaea087" UNIQUE ("team_id", "pokemon_id"), CONSTRAINT "PK_7476199eb32cce009aa0577c64c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'active', "trainer_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2b528aae0bc3881d44c884a761" ON "teams" ("trainer_id") `);
        await queryRunner.query(`CREATE TABLE "trainers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "cep" character varying(8), "address_street" character varying(255), "address_neighborhood" character varying(255), "address_city" character varying(255), "address_state" character varying(2), "address_country" character varying(255), "favorite_pokeapi_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_198da56395c269936d351ab774b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_trainers_email_active" ON "trainers" ("email") WHERE deleted_at IS NULL`);
        await queryRunner.query(`CREATE TABLE "pokemon_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type_name" character varying(50) NOT NULL, "damage_relations" jsonb NOT NULL, "fetched_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_4d2d359062d5345ac2aa14bd702" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bf70e70ec07565a2bfe9160901" ON "pokemon_types" ("type_name") `);
        await queryRunner.query(`ALTER TABLE "team_pokemon" ADD CONSTRAINT "FK_d57c055ab195ba614ccc4a1658e" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_pokemon" ADD CONSTRAINT "FK_f816a20fa75d6093c265e49b836" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teams" ADD CONSTRAINT "FK_2b528aae0bc3881d44c884a7618" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_2b528aae0bc3881d44c884a7618"`);
        await queryRunner.query(`ALTER TABLE "team_pokemon" DROP CONSTRAINT "FK_f816a20fa75d6093c265e49b836"`);
        await queryRunner.query(`ALTER TABLE "team_pokemon" DROP CONSTRAINT "FK_d57c055ab195ba614ccc4a1658e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bf70e70ec07565a2bfe9160901"`);
        await queryRunner.query(`DROP TABLE "pokemon_types"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainers_email_active"`);
        await queryRunner.query(`DROP TABLE "trainers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2b528aae0bc3881d44c884a761"`);
        await queryRunner.query(`DROP TABLE "teams"`);
        await queryRunner.query(`DROP TABLE "team_pokemon"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1cb8fc72a68e5a601312c642c8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a41ce442d4c6e998ae904fe2d3"`);
        await queryRunner.query(`DROP TABLE "pokemon"`);
    }

}
