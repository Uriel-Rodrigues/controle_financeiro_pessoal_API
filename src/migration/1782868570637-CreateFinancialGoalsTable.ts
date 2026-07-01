import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateFinancialGoalsTable1782868570637 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "financialGoals",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "title",
                    type: "varchar"
                },
                {
                    name: "description",
                    type: "varchar",
                },
                {
                    name: "target_amount",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    isNullable: false
                },
                {
                    name: "current_amount",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    isNullable: false
                },
                {
                    name: "target_date",
                    type: "date",
                    isNullable: false
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["active", "completed"],
                    isNullable: false
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
        //criar chave estrangeira coma atabela users
        await queryRunner.createForeignKey(
            "financialGoals",
            new TableForeignKey({
                name: "fk_financialGoals_users",
                columnNames: ["users_id"],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            })        
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //deletar a chave etrangeira
        await queryRunner.dropForeignKey("financialGoals", "fk_financialGoals_users")
        
        //deletar a tabela criada
        await queryRunner.dropTable("financialGoals")
    }

}
