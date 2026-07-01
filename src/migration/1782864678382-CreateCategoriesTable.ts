import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCategoriesTable1782864678382 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "categories",
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
                    name: "type",
                    type: "enum",
                    enum:["income", "expense"],
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
        //criar chave estrangeira tabela users
        await queryRunner.createForeignKey(
            "categories",
            new TableForeignKey({
                columnNames: ["users_id"],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //deletar a chave estrangeira
        const table = await queryRunner.getTable("categories")
        const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.includes("users_id"))
        if(foreignKey){
            await queryRunner.dropForeignKey("categories", foreignKey)
        }
        
        //deletar tabela criada
        await queryRunner.dropTable("categories")
    }

}
