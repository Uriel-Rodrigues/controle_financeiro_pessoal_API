import "reflect-metadata"
import dotenv from "dotenv"
import { DataSource } from "typeorm"
// importar a entidade category
import { Category } from "./entity/Categories"
// importar a entidade FinancialGoals
import { FinancialGoals } from "./entity/FinancialGoals"
// importar a entidade Transaction
import { Transaction } from "./entity/Transactions"
// importar a entidade User
import { User } from "./entity/Users"

//carregar as variaveis do arquivo .env
dotenv.config()

//?? operador de coalescência nula - 
// se o valor da esquerda for nulo sera usado o da direita 
const type = process.env.DB_TYPE ?? "mysql"

export const AppDataSource = new DataSource({
    type: type as "mysql",
    host: process.env.DB_HOST!,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USERNAME!, //username do banco
    password: process.env.DB_PASSWORD!, //senha do banco usado
    database: process.env.DB_DATABASE!, //nome do banco de dados
    synchronize: false,
    logging: true,
    entities: [Category, FinancialGoals, Transaction, User],
    subscribers: [],
    migrations: [__dirname + "/migration/*.js"],
})

//iniciar conecção com banco de dados
AppDataSource.initialize()
    .then(()=> {
        console.log("conexão com o banco de dados realizada com sucesso")
    })
    .catch((error) => {
        console.log("erro na conexão com o banco de dados:", error)
    })