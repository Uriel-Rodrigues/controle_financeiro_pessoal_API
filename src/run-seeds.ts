//importar conexão com o banco de daos 
import { AppDataSource } from "./data-source";
// importar seed users
import CreateUserSeed from "./seeds/CreateUserSeeds";
// importar seed categories
import CreateCategoriesSeed from "./seeds/CreateCategoriesSeeds";
// importar seed transactions
import CreateTransactionSeed from "./seeds/CreateTransactions";
// importar seed FinancialGoals
import CreateFinancialGoalsSeed from "./seeds/CreateFiancialGoalsSeeds";

const runSeeds = async () => {
    console.log("iniciando conexão com o banco de dados")
    //iniciar coneção com o banco 
    await AppDataSource.initialize()
    console.log("banco de dados conectado")

    try {
        //criar instancia para cada seed
        const userSeed = new CreateUserSeed()
        const categoriesSeed = new CreateCategoriesSeed()
        const transactionsSeed = new CreateTransactionSeed()
        const financialGoals = new CreateFinancialGoalsSeed()
        
        //executar a seed
        await userSeed.run(AppDataSource)
        await categoriesSeed.run(AppDataSource)
        await transactionsSeed.run(AppDataSource)
        await financialGoals.run(AppDataSource)
        
    } catch (error) {
        console.log(`erro ao axecutar seed, processo encerrado: ${error}`)
    }
    finally{
        //fechar conexão com o banco de dados
        await AppDataSource.destroy()
        console.log("conexão com o banco de dados encerrada")
    }
}

runSeeds()