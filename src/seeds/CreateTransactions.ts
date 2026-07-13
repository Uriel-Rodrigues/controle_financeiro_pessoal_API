//importar coneção com o banco de dados
import { DataSource } from "typeorm";
//importar a entidades a serem usadas 
import { User } from "../entity/Users"; 
import { Category } from "../entity/Categories";
import { Transaction } from "../entity/Transactions";
//importar o enum de da entidade transactions
import { transactionType } from "../entity/Transactions";

export default class CreateTransactionSeed {
    public async run(dataSource: DataSource): Promise <void> {
        //mensagem de inicio 
        console.log("iniciando seed para popupar entidade Transactions...")
        //criar repositorio das entidades necessarias
        const transactionsRepository = await dataSource.getRepository(Transaction)
        const usersRepository = await dataSource.getRepository(User)
        const categoriesRepository = await dataSource.getRepository(Category)  
        //verificar se existem registro
        const countTransaction = await transactionsRepository.count()
        //pararprocessamento caso ja exista registros na entidade tranaction
        if (countTransaction > 0){
            console.log("entidade Transactions ja possui registros, nenhum novo registro foi adicionado")
            return 
        }         
        //pegar um regiostro para FK categories
        const categories = await categoriesRepository.findOne({where: {id: 1}})
        //verificar se encontrou registro em categories
        if(!categories){
            console.log("erro: nenhum usuario encontrado com ID 1. verifique se a tabela 'categories' esta populada")
            return
        }
        //pegar um regiostro para FK users
        const user = await usersRepository.findOne({where: {id: 1}})
        //verificar se existe registro em users
        if(!user){
            console.log("erro: nenhum usuario encontrado com ID 1. verifique se a tabela 'users' esta populada")
            return
        }
        //criar registros para popular tabela
        const transactions = [
            {
                type: transactionType.INCOME,  
                description: "pagamento de salario",
                amount: 5000,
                transation_date: "2026-08-26",
                users: user,
                categories: categories
            },
            {
                type: transactionType.EXPENSE,  
                description: "transporte para casa",
                amount: 20,
                transation_date: "2026-08-24",
                users: user,
                categories: categories
            },
            {
                type: transactionType.INCOME,  
                description: "vendas de cartas",
                amount: 52,
                transation_date: "2026-08-26",
                users: user,
                categories: categories
            },
            {
                type: transactionType.EXPENSE,  
                description: "pagamento de internet",
                amount: 200,
                transation_date: "2026-08-26",
                users: user,
                categories: categories
            },
            {
                type: transactionType.EXPENSE,  
                description: "pagamento de gás",
                amount: 200,
                transation_date: "2026-08-26",
                users: user,
                categories: categories
            },
            {
                type: transactionType.EXPENSE,  
                description: "supermarcado",
                amount: 1000,
                transation_date: "2026-08-26",
                users: user,
                categories: categories
            }
        ]
        //salvar registros
        await transactionsRepository.save(transactions) 
        //retornar mensagem de sucesso
        console.log("seed concluida com sucesso: Transações cadastrados")
    }
}