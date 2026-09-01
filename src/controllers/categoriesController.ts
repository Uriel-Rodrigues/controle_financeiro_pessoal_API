//importar a biblioteca express
import express, {Request, Response} from "express";
//importar conecção com o banco de dados
import { AppDataSource } from "../data-source";
// importar entidade que vai ser usada
import { Category } from "../entity/Categories";
//importar sistema de validadção de dados yup
import * as yup from "yup"
//importa biblioteca not do typeorm para buscar no banco 
import { Not } from "typeorm";
//importar serviço de paginação 
import { PaginationService } from "../Services/PaginationService";
import { verifyToken, AuthRequest } from "../middleware/authMiddleware";

//criar aplicação express
const router = express.Router()

//criar rota para LISTAR todos os registros (verbo GET)
router.get("/categories/list", verifyToken, async (req: AuthRequest, res:Response) =>{
    try {
        //obter id do usuario encaminhad atraves do token
        const userId = req.user!.id
        //obater o repositorio da entidade
        const categoriesRpository = await AppDataSource.getRepository(Category)
        //receber o numero da pagina e definir 1 como padrão
        const page = Number (req.query.page) || 1
        // definir o numero de requistros por pagina
        const limit = Number (req.query.limit) || 3
        //user o serviço de paginação
        const result = await PaginationService.paginate(categoriesRpository,page,limit, {id: "DESC"},undefined, {users: {id: userId}})
        //retornar os registros para o usuario COM PAGINAÇÃO
        res.status(200).json(result)
        
    } catch (error) {
        //retornar menssagem em caso de erro
        res.status(500).json({
            message: `error nao foi possiel listar categorias: ${error}`
        })
    }
})

//criar rota para LISTAR somente um REGISTRO ESPECIFICO (verbo GET)
router.get("/categories/:id", async (req:Request, res:Response) => {
    try {
        //pegar dados que vem pela URL
        const {id} = req.params 
        //criar repositorio da etidade
        const categoriesRpository = await AppDataSource.getRepository(Category)
        //verificar pelo id se a categoria soliitada existe 
        const existCategory = await categoriesRpository.findOne({
            where: {id: parseInt(id as string)}
        })
        //retornar menssagem caso nao exista
        if(!existCategory){
            res.status(404).json({
                message: "Categoria nao encontrada!"
            })
        }
        //retornar mensagem com os dados caso exista
        res.status(200).json(existCategory)

    } catch (error) {
        //retornar menssagem em caso de erro
        res.status(500).json({
        message: `error, não foi possivel carregar a categoria desejada: ${error} `
        })
        
    }
})

//criar rota para CRIAR novo registro de ategoria (verbo POST)
router.post("/categories/create",verifyToken, async (req: AuthRequest, res:Response) =>{
    try {
        //pegar os dados que vem pela requisição
        const data = req.body
        //pegar o id do usuario que vem pelo token
        const userId = req.user!.id
        //validade campos com yup
        const schema = yup.object().shape({
            name: yup.string().required("o nome da categoria é obrigatorio").min(3, "o  nome deve ter elo menos 3 caracteres"),
            type: yup.string().required("informar o tipo da cateoria é obrigatorio (income ou expense)"),
        })
        //verificar se os dados passaram na validação
        await schema.validate(data,{abortEarly:false}) 
        //criar o repositorio da entiade
        const categoriesRpository = await AppDataSource.getRepository(Category)
        
        //criar novo registro
        const newCategory = await categoriesRpository.create({
            name: data.name.toLowerCase(),
            type: data.type,
            users: {id: userId}
        })
        //salver novo registro
        await categoriesRpository.save(newCategory)
        //retornar mensagem de sucesso
        res.status(200).json({
            message: "nova catgoria cadastrada com sucesso"
        })
    } catch (error) {
        //verificar se existe erro de validação
        if(error instanceof yup.ValidationError){
            message: error.errors
        }
        //retornar menssagem de erro caso tenha
        res.status(500).json({
            message: `error nova categoria não cadastrada: ${error}`
        })  
    } 
})

//criar rota para EDITAR um registro ja existente (verbo PUT)
router.put("/categories/:id",verifyToken, async (req:Request, res:Response) => {
    try {
        //pegar os registro indicado pela URL 
        const {id} = req.params
        //pegar os dados que vem pela requisição
        const data = req.body
        //verificar os dados com yup
        const schema = yup.object().shape({
            name: yup.string().required("campo nome é obrigatorio!").min(3, "o campo deve ter minimo de 3 caracteres").trim(),
            type: yup.string().required("campo type é obrigatorio! (income ou expense)")
        })
        //verificar se os dados passaram na validação 
        await schema.validate(data,{abortEarly: false})
        //criar o repositorio da entidade
        const categoriesRpository = await AppDataSource.getRepository(Category) 
        //buscar o registro
        const category = await categoriesRpository.findOneBy({id: parseInt(id as string)})
        //verificar se o registro foi encontrado
        if(!category) {
            return res.status(404).json({
                message: "categoria não encontada"
            })
        }
        //verificar se ja existe alguma categoria com o mesmo nome
        const existCategory = await categoriesRpository.findOne({
            where: 
                {
                    name: data.name.toLowerCase(),
                    id: Not(parseInt(id as string))
                }
        })
        //retornar mensagem caso ja exista categoria com o mesmo nome 
        if(existCategory){

            return res.status(409).json({
                message: "ja existe uma categoria com esse nome, tente outro!"
            })
        }
        //editar o novo registro (merge)
        const updateCategory = await categoriesRpository.merge(category!,data)
        //salvar o registro editado
        await categoriesRpository.save(updateCategory) 
        //retornar mensagem de sucesso para o usuario
        res.status(200).json({
            message: `categoria atualizada com sucesso: updateCategory`,
            category: updateCategory
        })
    } catch (error) {
        //verificar se existe ero na validação
        if (error instanceof yup.ValidationError){
            message: error.errors
        }
        //retornar menssagem generica de erro 
        res.status(500).json({
            message: `erro ao editar categoria: ${error}`
        })   
    }
})

//criar rota para DELETAR um registro (verbo DELETE)
router.delete("/categories/delete/:id",verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        //pegar os dados encaminhadospela URL 
        const {id} = req.params
        //pegar o id do usuario encaminhado pelo token 
        const userId = req.user!.id
        //converter id para numero 
        const categoriesId = Number(id)
        //criar o repositorio da entidade
        const categoriesRpository = await AppDataSource.getRepository(Category)
        //verificar se o registro existe
        //procura o id da categoria no usuario logado 
        const category = await categoriesRpository.findOne({
            where: {
                id: categoriesId, 
                users: {id: userId}}
        })
        //retornar mensagem caso categoria nao exista 
        if(!category){
            return res.status(404).json({
                message: "categoria nao encontrada, tente outra"
            })
        }
        //deletar registro caso exista
        await categoriesRpository.remove(category)
        //retornar mensagem de sucesso para usuario
        res.status(200).json({
            message: "registro deletado com sucesso",
            category: category
        }) 
    } catch (error) {
        //retornar mensagem de erro
        res.status(500).json({
            message: `error nao foi possivel deletar a categoria: ${error}`
        })
        
    }
})

export default router