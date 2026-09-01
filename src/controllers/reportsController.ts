//Importa a biblioteca Express
import express, {Request, Response} from "express";
//importar conxão com banco de dados
import { AppDataSource } from "../data-source";

//imporat o middlewares de verificação
import { verifyToken, AuthRequest } from "../middleware/authMiddleware";
// importar entidade TRANSACTION
import { Transaction } from "../entity/Transactions";
// importar a entidade financialGoals
import { FinancialGoals } from "../entity/FinancialGoals";
// importar a biblioteca para subitrair meses
import {subMonths, format} from "date-fns"
// importar o lacale em portugues
import { ptBR } from "date-fns/locale";

//criar a aplicação express
const router = express.Router()

//criar a rota paa obter relatorios de transações cadastradas mensalmente 
//endereço para acessar api atraves da aplicação esterna com o verbo GET:
//http://localhost:8080/transaction-report
//enviar o bearer token do usuario logado, exemplo: Bearer
//<colocar-o-token-gerad0-com-jwt>
router.get("/transaction-report", verifyToken,  async(req: AuthRequest, res: Response) => {
    try{
        //Pegar o id do usuario que vem do token 
        const userId = req.user!.id

        //obter o repositorio da entidade User
        const transactionRepository = AppDataSource.getRepository(Transaction)

        //criar um array com o sultimos 12 mees no formato 'YYYY-MM'
        const months = Array.from({length: 12}, (_,i) => {
            const date = subMonths(new Date(), 11 - i)
            return {
                key:format(date, "yyyy-MM"),//chave no formato yyyy-MM
                label: format(date, "MMM", {locale: ptBR}).replace(".",""), //nome do mes abreviado
            }
        })

        //buscar a quantidade de usuarios cadastrados agrupados por mes e ano
        const result = await transactionRepository
            .createQueryBuilder("transactions")
            .select([
                `DATE_FORMAT(transactions.created_at, '%Y-%m') AS month`,
                `COUNT(transactions.id) AS transactions`
            ])
        //filtrar os registros para considerar apenas usuarios criados a partir da data nicial 
        .innerJoin("transactions.users", "users")
        .where("transactions.created_at >= :startDate", {startDate: months[0].key + "-01"}) // primeiro dia do primeiro mês
        .andWhere (
            'users.id = :userId', {userId}
        )
        .groupBy("month") //agrupa os registros pelo mes formatado (YYYY-MM)
        .orderBy("month", "ASC") //ordena os resultados de forma crescente (ASC) pelo mes
        .getRawMany() //executa a consulta e retorna os resultados como um array de objetos javaScript

        const resultMap = new Map(result.map((r) => [r.month, parseInt(r.transactions, 10)]))

        //prencher os meses ausesntes com 0 usuarios e substituir pelo nome abreviado
        const finalResult = months.map(({key, label}) => ({
            month: label, //nome do mes abreviado
            transactions: resultMap.get(key) || 0
        }))

        //retorna a resposta com os dados e informações da paginação
        res.status(200).json(finalResult)
        return
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            menssage: "erro ao listar registro de transações tente novamente"
        })
    }
})

//criar a rota paa obter relatorios de metas financeiras cadastradas mensalmente 
//endereço para acessar api atraves da aplicação esterna com o verbo GET:
//http://localhost:8080/financialGoals-report
//enviar o bearer token do usuario logado, exemplo: Bearer
//<colocar-o-token-gerad0-com-jwt>
router.get("/financialGoals-report", verifyToken,  async(req: AuthRequest, res: Response) => {
    try{
        //Pegar o id do usuario que vem do token 
        const userId = req.user!.id

        //obter o repositorio da entidade User
        const financialGoalsRepository = AppDataSource.getRepository(FinancialGoals)

        //criar um array com o sultimos 12 mees no formato 'YYYY-MM'
        const months = Array.from({length: 12}, (_,i) => {

            // Subtrai meses da data atual para obter os últimos 12 meses.
            const date = subMonths(new Date(), 11 - i)
            return {
                key:format(date, "yyyy-MM"),//chave no formato yyyy-MM
                label: format(date, "MMM", {locale: ptBR}).replace(".",""), //nome do mes abreviado
            }
        })

        //buscar a quantidade de usuarios cadastrados agrupados por mes e ano
        const result = await financialGoalsRepository
            .createQueryBuilder("financialgoals")
            .select([
                `DATE_FORMAT(financialgoals.created_at, '%Y-%m') AS month`,
                `COUNT(financialgoals.id) AS financialGoals`
            ])
        //filtrar os registros para considerar apenas usuarios criados a partir da data nicial
        .innerJoin("financialgoals.users", "users") 
        .where("financialgoals.created_at >= :startDate", {startDate: months[0].key + "-01"}) // primeiro dia do primeiro mês
        .andWhere (
            'users.id = :userId', {userId}
        )
        .groupBy("month") //agrupa os registros pelo mes formatado (YYYY-MM)
        .orderBy("month", "ASC") //ordena os resultados de forma crescente (ASC) pelo mes
        .getRawMany() //executa a consulta e retorna os resultados como um array de objetos javaScript

        const resultMap = new Map(result.map((r) => [r.month, parseInt(r.financialgoals, 10)]))

        //prencher os meses ausesntes com 0 usuarios e substituir pelo nome abreviado
        const finalResult = months.map(({key, label}) => ({
            month: label, //nome do mes abreviado
            financialGoals: resultMap.get(key) || 0
        }))

        //retorna a resposta com os dados e informações da paginação
        res.status(200).json(finalResult)
        return
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            menssage: "erro ao listar registro de metas financeiras tente novamente"
        })
    }
})

export default router