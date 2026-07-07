//importar a biblioteca express
import express, {Request, Response} from "express";
//importar conecção com o banco de dados
import { AppDataSource } from "../data-source";
// importar entidade que vai ser usada
import { User } from "../entity/Users";
//importar sistema de validadção de dados yup
import * as yup from "yup"
//importa biblioteca not do typeorm para buscar no banco 
import { Not } from "typeorm";

//criar aplicação express
const router = express.Router()

//criar rota para LISTAR todos os registros (verbo GET)
router.get("/users/list", async (req:Request, res: Response)=> {
    try {
        //pegar o repositorio da entidade
        const userRepository = await AppDataSource.getRepository(User)

        //recuperar todos os usuarios no baco 
        const users = await userRepository.find()

        //restornar os dados obtidos
        res.status(200).json(users)
        
    } catch (error) {
        res.status(500).json({
            message: `erro ao listar os usuarios: ${error}`
        })
        
    }
})

//criar rota para LISTAR somente um REGISTRO ESPECIFICO (verbo GET)
router.get("/users/:id",  async (req:Request, res:Response) => {
    try {
        //pegar o id encaminhado pela URL
        const {id} = req.params
        //pegar o repositorio da entidade users
        const userRepository = AppDataSource.getRepository(User)
        //verificar se existe um usuario com o mesmo id
        const user = await userRepository.findOne({
            where: {id: parseInt(id as string)}
        })
        //verificar se o usuario existe
        if(!user){
            return res.status(404).json({
                message:"Usuario não encontrado!"
            })
        }
        //retornar o usuario caso encontrado
        res.status(200).json(user)

    } catch (error) {
        res.status(500).json({
            message: `error, Não foi possivel carregar o usuario desejado: ${error}`
        })
        
    }
})

//criar rota para CADASTRAR novo registro (verbo POST)
router.post("/users/create", async (req:Request, res:Response) =>{
    try {
        var data = req.body
        //validar os dados encaminhados na requisição com yup
        const schema = yup.object().shape({
            name: yup.string().required("o campo nome é obrigatorio!").min(3, "o campo nome deve ter no minimo 3 caracteres!"),
            email: yup.string().required("o campo email é obbrigatorio!").email(),
            password: yup.string().required("o campo senha é obrigatorio!").min(8,"a senha precisa conter no minimo 8 caracteres!")
        })
        //verificar se os dados encaminhados passaram na validação
        await schema.validate(data, {abortEarly: false})
        //pega o repositorio da entidade user 
        const userRepository = AppDataSource.getRepository(User)
        //bucar no repositorio um registro com o mesmo email
        const existUser = await userRepository.findOne({
            where: {email: data.email}
        })
        //verificar se nao existe um outro usuario com o mesmo email
        if(existUser){
            return res.status(409).json({
                message: "email de usuario ja cadastrado, tente outro"
            })

        } 

        //cria um novo registro 
        const newUser = userRepository.create(data)
        //salva o novo registro 
        await userRepository.save(newUser)
        //retornar resposta de sucesso
        res.status(200).json({
            message: "novo usuarios casdastrado com sucesso",
            user:newUser
        })
        
    } 
    catch (error) {
        //verificar se existe erro na validação
        if(error instanceof yup.ValidationError){
            res.status(400).json({
                message: error.errors
            })
        }
        //menssagem generica de erro
        console.log(error)
        res.status(500).json({
            message: `erro ao cadastrar usuario: ${error}` 
        })
    }
})

//criar rota para EDITAR um registro ja existente (verbo PUT)
router.put("/users/:id", async (req: Request, res: Response) => {
    try {
        //pegar parametro da url que indica o registro
        const {id} = req.params
        //pegar os dados do registro
        const data = req.body
        //validar dados encaminhados com yup
        const schema = yup.object().shape({
            name: yup.string().required("o campo nome é obrigatorio!").min(3, "o campo nome deve ter no minimo 3 caracteres!"),
            email: yup.string().required("o campo email é obbrigatorio!").email(),
            password: yup.string().required("o campo senha é obrigatorio!").min(8,"a senha precisa conter no minimo 8 caracteres!")
        })
        //verificar se dados passaram na validação
        await schema.validate(data,{abortEarly:false})
        //pegar o repositorio da entidade users
        const userRepository = await AppDataSource.getRepository(User)
        //buscar registro especificado
        const user = await userRepository.findOne({
            where: {id: parseInt(id as string)}
        })
        //verificar se foi encontrado
        if (!user){
            return res.status(404).json({
                message:"error Usuario nao ncontrado"
            })
        }  
        //verificar se existe alguem com o mesmo email excluindo o proprio registro
        const existUserEmail = await userRepository.findOne({
            where: 
            {
                email: data.email,
                id: Not(parseInt(id as string))
            }
        }) 

        //encerrar edição caso ja exista usuario com mesmo email
        if(existUserEmail) {
            return res.status(409).json({
                message:"ja existe um usuario com esse email, tente outro"
            })
        }
        //realisar alteração (merge)
        await userRepository.merge(user!, data)
        //salvar alterações (save)
        const updateUsser = await userRepository.save(user!)
        //retornar mensagem de sucesso
        res.status(200).json({
            message: "reistro atualizado com sucesso"
        })
    } catch (error) {
        //verfica se existem erros de validação - retorna menssagem
        if(error instanceof yup.ValidationError){
            res.status(400).json({
                message:error.errors
            })
        }
        //retornar mensagem generica de erro com erro
        res.status(500).json({
            message: `error nao foi possivel atualizar o usuario: ${error}`
        })
    }
})

//criar rota para DELETAR registro (verbo DELETE)
router.delete("/users/:id", async (req:Request, res:Response) => {
    try {
        //pegar id do usuario pela url
        const {id} = req.params
        //pegar repositorio da  entidade user
        const userRepository = await AppDataSource.getRepository(User)
        //verificar se o usuario existe
        const existUser = await userRepository.findOne({
            where: {id: parseInt(id as string)}
        })
        
        if(!existUser){
            return res.status(404).json({
                message: "error usuario nao enontrado"
            })
        }
        //deletar usuario caso encontrado
        await userRepository.remove(existUser)
        //retornar mensagem de sucesso
        res.status(200).json({
            message: "registro de usuario deletado com sucesso!"
        }) 
        
    } catch (error) {
        //encaminha menssagem de erro ao deletar
        res.status(500).json({
            message: `erro ao deletar o usuario tenta: ${error}`
        })
    }
})

//exportar
export default router