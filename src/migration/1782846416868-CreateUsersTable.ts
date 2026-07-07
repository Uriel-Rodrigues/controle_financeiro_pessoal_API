import { MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateUsersTable1782846416868 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "users",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "varchar"
                },
                {
                    name: "email",
                    type: "varchar",
                    isUnique: true,
                    isNullable: false
                },
                {
                    name: "password",
                    type: "varchar",
                },
                {
                    name: "recoverPassword",
                    type: "varchar",
                    isUnique: true, 
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP" 
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
        ]

        }))
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //remover a tabela criada
        await queryRunner.dropTable("users")
    }

}
