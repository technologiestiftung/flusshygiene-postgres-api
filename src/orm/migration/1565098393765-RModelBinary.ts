import { MigrationInterface, QueryRunner } from 'typeorm';

export class RModelBinary1565098393765 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "bathingspot_model" ADD COLUMN IF NOT EXISTS "rmodelBinary" bytea`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "bathingspot_model" DROP COLUMN "rmodelBinary"`,
    );
  }
}
