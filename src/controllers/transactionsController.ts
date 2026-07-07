//importar a biblioteca express
import express, {Request, Response} from "express";
//importar conecção com o banco de dados
import { AppDataSource } from "../data-source";
// importar entidade que vai ser usada
import { Transaction } from "../entity/Transactions";
//importar sistema de validadção de dados yup
import * as yup from "yup"
//importa biblioteca not do typeorm para buscar no banco 
import { Not } from "typeorm";
import { transferableAbortController } from "node:util";


//criar aplicação express
const router = express.Router()

//criar rota para LISTAR todos os registros (verbo GET)
router.get("/transaction/list", async (req: Request, res: Response) => {
    try {
        //criar o repositorio da entidade
        const transactionsRepository = await AppDataSource.getRepository(Transaction)
        //recuperar os dados
        const transactions = await transactionsRepository.find()
        //retornar os registros cadastrados
        res.status(200).json(transactions)
    } catch (error) {
        res.status(500).json({
            message: `error ao listar as transações: ${error}`
        })
    }
})

////criar rota para LISTAR somente um REGISTRO ESPECIFICO (verbo GET)
router.get("/transaction/:id", async (req: Request, res: Response) => {
    try {
        //pegar os dados que vem pela URL
        const {id} = req.params
        //pegar os dados que vem pela requisição
        const data = req.body
        //criar o repositorio da entidade
        const transactionRepository = await AppDataSource.getRepository(Transaction)
        //verificar se o registro buscado existe
        const transaction = await transactionRepository.findOneBy({id: parseInt(id as string)})
        if(!transaction){
            return res.status(404).json({
                message: "Transação solicitada nao existe, tente outra!"
            })
        }
        //retornar o registro
        res.status(200).json(transaction)

    } catch (error) {
        //retornar mensagem de erro
        res.status(500).json({
            message: `error nao é possivel carregar a transação: ${error}`
        })
    }
})

//riar rolta para CADASTRAR transações (verbo post)
router.post('/transaction/create', async (req: Request, res: Response) => {
    try {
        //pegar dados enviados pela requisição
        var data = req.body
        //validar dados com yup
        const schema = yup.object().shape({
            type: yup.string().required("necessario informar o tipo da transação: income ou expense"),
            description: yup.string().required("necessario informar desrição da transação").min(3, "descrição deve ter minimo de 3 caracteres"),
            transation_date: yup.date().required("necessario informar data da transação YYYY-MM-DD").max(new Date(), "a data da transação nao pode ser uma data futura"),
            observations: yup.string().notRequired()
        })
        //verificar se os dados passaram na erificação
        await schema.validate(data, {abortEarly:false})
        //pegar repositorio da entidade
        const transactionRepository = await AppDataSource.getRepository(Transaction)
        //criar novo registro
        const newTransaction = await transactionRepository.create({
            type: data.type,
            amount: data.amount,
            description: data.description,
            transation_date: data.transation_date,
            observations: data.observations,
            users: {
                id: data.usersId
            },
            categories: {
                id: data.categoriesId
            }
        })
        //slavar novo registro
        await transactionRepository.save(newTransaction) 
        //retornar mensagem de sucesso
        res.status(200).json({
            message: "nova transação cadastrada com sucesso"
        }) 
    } catch (error) {
        if(error instanceof yup.ValidationError){
            res.status(400).json({
                message: error.errors
            })
        }
        //retornar mnsagem de erro
        res.status(500).json({
            message: `error, transação não cadastrada: ${error}`
        })
        
    }
})

//criar rota para EDITAR um registro ja existente (verbo PUT)
router.put("/transaction/:id", async (req: Request, res: Response) => {
    try {
        //pegar os dados encaminhados pela URL
        const {id} = req.params
        //pegar os dados encaminhados pela requisição
        const data = req.body
        //validar dados pelo yup
        const schema = yup.object().shape({
            type: yup.string().required("o tipo da transação precisa se informado!").min(3, "o tipo deve conter pelo menos 3 caracteres"),
            description: yup.string().required("descrição é obrigatoria!").min(3, "a descrição deve conter pelo menos 3 caracteres"),
            amount: yup.number().required("o valor da transação deve ser informado!"),
            transation_date: yup.date().required("a data da transação deve ser informada! YYYY-MM-DD").max(new Date(), "a data da transação nao pode ser uma data futura"),
            observations: yup.string().notRequired()
        })
        //verificar se os dados passaram na validação
        await schema.validate(data,{abortEarly:false})
        //criar o repositorio da entidade
        const transactionRepository = await AppDataSource.getRepository(Transaction)
        //procurar registro solicitado
        const transaction = await transactionRepository.findOneBy({id: parseInt(id as string)})
        if(!transaction){
            res.status(404).json({
                message: "transação não econtrada!"
            })
        }
        //editar o novo registro
        const updatetransaction = await transactionRepository.merge(transaction!, data)
        //salvar novo registro
        await transactionRepository.save(updatetransaction)
        //retornar mensagem de sucesso para o usuario
        res.status(200).json({
            message: "registro atualizado com sucesso",
            transaction: transaction 
        }) 

    } catch (error) {
        //verificar se existe erro de validação
        if(error instanceof yup.ValidationError){
            message: error.errors
        }
        //retornar mensagem de erro
        res.status(500).json({
            message: `error não foi possivel atualizar o registro: ${error}`
        })
    }
})

//criar rota para DELETAR um registro (verbo DELETE)
router.delete("/transaction/:id", async (req: Request, res:Response) => {
    try {
        //pegar os dados encaminhados pela URL
        const {id} = req.params
        //criar repositorio da entidade
        const transactionRepository = await AppDataSource.getRepository(Transaction)
        //verificar se o registro existe
        const transaction = await transactionRepository.findOneBy({id: parseInt(id as string)})
        //retornar mensagem caso nao exista 
        if(!transaction){
            return res.status(404).json({
                message: "transação nao encontrada"
            })
        }
        //deletar registro
        await transactionRepository.remove(transaction) 
        //retornar mensagem caso exista
        res.status(200).json({
            message: "Transação deletata com sucesso",
            transaction: transaction
        })
    } catch (error) {
        //retornar mensagem de erro
        res.status(500).json({
            message: `error: transação não deletada: ${error}`
        }) 
    }
})
export default router