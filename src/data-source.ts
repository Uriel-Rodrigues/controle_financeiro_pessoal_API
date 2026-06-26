import "reflect-metadata"
import { DataSource } from "typeorm"

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
    entities: [],
    subscribers: [],
    migrations: [],
})