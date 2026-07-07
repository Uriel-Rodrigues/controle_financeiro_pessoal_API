import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTransactionsTable1782866776206 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "transactions",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "type",
                    type: "enum",
                    enum: ["income", "expense"],
                    isNullable: false
                },
                {
                    name: "description",
                    type: "varchar",
                },
                {
                    name: "amount",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    isNullable:false 
                },
                {
                    name: "transation_date",
                    type: "date",
                    isNullable: false
                },
                {
                    name: "observations",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "usersId",
                    type: "int"

                },
                {
                    name: "categoriesId",
                    type: "int"
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
        //criando chave estrangeira com a tabela users
        await queryRunner.createForeignKey(
            "transactions",
            new TableForeignKey({
                name: "fk_transactions_users",
                columnNames: ["usersId"],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            })
        )

        //criando chave estrangeira com a tabela categories
        await queryRunner.createForeignKey(
            "transactions",
            new TableForeignKey({
                name:"fk_transactions_categories",
                columnNames: ["categoriesId"],
                referencedTableName: "categories",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    //detelar a chave estrangeira com a tabela users
    await queryRunner.dropForeignKey("transactions", "fk_transactions_users" )
    
    //detelar a chave estrangeira com a tabela categories
    await queryRunner.dropForeignKey("transactions", "fk_transactions_categories",)

    //deletar a tabela criada
    await queryRunner.dropTable("transactions")
    }

}
