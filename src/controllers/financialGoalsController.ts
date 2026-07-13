//importar a biblioteca express
import express, {Request, Response} from "express";
//importar conecção com o banco de dados
import { AppDataSource } from "../data-source";
// importar entidade que vai ser usada
import { FinancialGoals } from "../entity/FinancialGoals";
//importar sistema de validadção de dados yup
import * as yup from "yup"
//importa biblioteca not do typeorm para buscar no banco 
import { Not } from "typeorm";
//importar serviço de paginação
import { PaginationService } from "../Services/PaginationService";

//criar aplicação express
const router = express.Router()

//criar rota para LISTAR todos os registros (verbo GET)
router.get("/financialGoals/list", async (req:Request, res:Response) =>{
    try {
        //criar repositorio da entidade
        const financialGoalsRepository = await AppDataSource.getRepository(FinancialGoals)

        //receber o numero da pagina e definir 1 como padrão
        const page = Number (req.query.page) || 1
        // definir o numero de requistros por pagina
        const limit = Number (req.query.limit) || 3
        //user o serviço de paginação
        const result = await PaginationService.paginate(financialGoalsRepository,page,limit, {id: "DESC"})
        //retornar os registros para o usuario COM PAGINAÇÃO
        res.status(200).json(result)
        
    } catch (error) {
        //retornar mensagem de erro 
        res.status(500).json({
            message: `error ao carregar metas financeiras: ${error}`
        })
    }
})

//criar rota para LISTAR somente um REGISTRO ESPECIFICO (verbo GET)
router.get("/financialGoals/:id", async (req: Request, res: Response) => {
    try {
        //pegar dados quevem pela URL
        const {id} = req.params
        //pegar os dados da requisição
        const data = req.body 
        //criar repositorio da entidade
        const financialGoalsRepository = await AppDataSource.getRepository(FinancialGoals)
        //verificar se o registro existe
        const financialGoals = await financialGoalsRepository.findOneBy({id: parseInt(id as string)})
        //retornar mensagem e parar processamento caso nao exista
        if(!financialGoals){
            res.status(404).json({
                message: "Registro de meta financeira não encontrada"
            })
        } 
        //retornar registro se existir 
        res.status(200).json(financialGoals)
    } catch (error) {
        //retornar mensagem de erro 
        res.status(500).json({
            message: `error impossivel mostrar o registro: ${error}`
        })
    }
})

//criar rota para CRIAR novo registro de ategoria (verbo POST)
router.post("/financialGoals/create", async (req: Request, res:Response) => {
    try {
        //pegar os dados que vem pela requisição
        const data = req.body
        //validar dados com yup
        const schema = yup.object().shape({
            title: yup.string().required("campo titulo é obrigatorio!"),
            description: yup.string().required("campo descrição é obrigatorio!").min(3, "a descrição deve ter minimo de 3 caracteres"),  
            target_amount: yup.number().required("campo valor alvo é obrigatorio!").typeError("o campo deve ser um numero!"), 
            current_amount: yup.number().required("campo valor atual é obrigatorio!").typeError("o campo deve ser um numero!"),
            target_date: yup.date().required("campo para data da meta é obriogatorio! YYYY-MM-DD").min(new Date(), "a data da meta nao pode ser uma data passada"),
            status: yup.string().required("status do objetivo fincanceiro é obrigatorio! active ou completed")
        })
        //verificar se os dados passaram na validação
        await schema.validate(data, {abortEarly:false}) 
        //pegar repositorio da entidade 
        const financialGoalsRepository = await AppDataSource.getRepository(FinancialGoals)
        //criarnovo registro
        const newFinancialGoals = await financialGoalsRepository.create({
            title: data.title,
            description: data.description,
            target_amount: data.target_amount,
            current_amount: data.current_amount,
            target_date: data.target_date,
            status: data.status.toLowerCase(),
            users: {
                id: data.usersId
            }
        })
        //salvar registro 
        await financialGoalsRepository.save(newFinancialGoals)
        //retornar mensagem de sucesso
        res.status(200).json({
            message: "Meta financeira cadastrada com sucesso",
            financialGoals:newFinancialGoals
        }) 
    } catch (error) {
        //verificar se possui erro de validação
        if(error instanceof yup.ValidationError){
            message: error.errors
        }
        //retornar mensagem de erro
        res.status(500).json({
            message: `error meta financeira não cadastrada: ${error}`
        })
    }
})

//criar rota para EDITAR um registro ja existente (verbo PUT)
router.put("/financialGoals/:id", async (req: Request, res: Response) => {
    try {
        //pegar dados que vem pela URL
        const {id} = req.params
        //pegar os dados que vem pela requisição
        const data = req.body
        //validadar dados com yup
        const schema = yup.object().shape({
            title: yup.string().required("campo titulo é obrigatorio!"),
            description: yup.string().required("campo descrição é obrigatorio!").min(3, "a descrição deve ter minimo de 3 caracteres"),  
            target_amount: yup.number().required("campo valor alvo é obrigatorio!").typeError("o campo deve ser um numero!"), 
            current_amount: yup.number().required("campo valor atual é obrigatorio!").typeError("o campo deve ser um numero!"),
            target_date: yup.date().required("campo para data da meta é obriogatorio! YYYY-MM-DD").min(new Date(), "a data da meta nao pode ser uma data passada"),
            status: yup.string().required("status do objetivo fincanceiro é obrigatorio! active ou completed")
        })
        //virificar se os dados passaram na validação
        await schema.validate(data,{abortEarly:false})
        //criar repositorio da entidade
        const financialGoalsRepository = await AppDataSource.getRepository(FinancialGoals)
        //buscar registro
        const financialGoals = await financialGoalsRepository.findOneBy({id: parseInt(id as string)})
        //retornar mensagem caso não seja achado e parar processamento        
        if(!financialGoals){
            return res.status(404).json({
                message: "meta financeira não encontrada"
            })
        } 

        //editar registro (merge)
        const updateFinancialGoals = await financialGoalsRepository.merge(financialGoals!, data)
        //salvar registro
        await financialGoalsRepository.save(updateFinancialGoals) 
        //retornar mensagem de sucesso
        res.status(200).json({
            message: "meta financeira atualizada com sucesso",
            financialGoals: financialGoals
        })

    } catch (error) {
        //verificar se existe erro de validação
        if(error instanceof yup.ValidationError){
            message: error.errors
        }
        //retornar mensagem de erro
        res.status(500).json({
            message: `error meta financeira não atualizada: ${error}`
        })
    }
})

//criar rota para DELETAR registro (verbo DELETE)
router.delete("/financialGoals/:id", async (req: Request, res: Response) => {
    try {
        //pegar dados que vem pela URL
        const {id} = req.params
        //criar repositorio da entidade
        const financialGoalsRepository = await AppDataSource.getRepository(FinancialGoals)
        //verificar se o registro existe
        const financialGoals = await financialGoalsRepository.findOneBy({id: parseInt(id as string)})
        //retornar mensagem caso nao exista e parar processamento 
        if(!financialGoals){
            return res.status(404).json({
                message: "meta financeira não encontrada"
            })
        }
        //deletar reegistro
        await financialGoalsRepository.remove(financialGoals) 
        //retornar mensagem de sucesso
        res.status(200).json({
            message: "meta financeira deletada com sucesso "
        })
    } catch (error) {
        //retornar mensagem de erro
        res.status(500).json({
            message: `error meta financeira não deletada: ${error}`
        })
        
    }
})
export default router


