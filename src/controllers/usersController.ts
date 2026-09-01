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
//importaer serviço de paginação
import { PaginationService } from "../Services/PaginationService";
//importar biblioteca para criptografar senha 
import bcrypt from "bcryptjs"
//importar middleware de autenticação
import { verifyToken, AuthRequest } from "../middleware/authMiddleware";

//criar aplicação express
const router = express.Router()

//criar rota para LISTAR todos os registros (verbo GET)
router.get("/users/list", verifyToken, async (req:Request, res: Response)=> {
    try {
        //pegar o repositorio da entidade
        const userRepository = await AppDataSource.getRepository(User)
        //receber o numero da pagina e definir 1 como padrão
        const page = Number (req.query.page) || 1
        // definir o numero de requistros por pagina
        const limit = Number (req.query.limit) || 3
        //user o serviço de paginação
        const result = await PaginationService.paginate(userRepository,page,limit, {id: "DESC"})
        //retornar os registros para o usuario COM PAGINAÇÃO
        res.status(200).json(result)
        
    } catch (error) {
        res.status(500).json({
            message: `erro ao listar os usuarios: ${error}`
        })
        
    }
})

//criar rota para LISTAR somente um REGISTRO ESPECIFICO (verbo GET)
router.get("/users/me", verifyToken,  async (req:AuthRequest, res:Response) => {
    try {
        //pegar o id de usuario encaminhado pelo token
        const userId = req.user!.id
        //pegar o repositorio da entidade users
        const userRepository = AppDataSource.getRepository(User)
        //verificar se existe um usuario com o mesmo id
        const user = await userRepository.findOne({
            where: {id: userId}
        })
        //verificar se o usuario existe
        if(!user){
            return res.status(404).json({
                message:"Usuario não encontrado!"
            })
            return
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

        //metodo de criptografia implementado dentro da entidade
        //criptografar senha antes de salvar
        //data.password = await bcrypt.hash(data.password, 10)

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
router.put("/users/edit", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        //pegar parametro da url que indica o registro
        const userId = req.user!.id
        //pegar os dados do registro
        const data = req.body
        //validar dados encaminhados com yup
        const schema = yup.object().shape({
            name: yup.string().required("o campo nome é obrigatorio!").min(3, "o campo nome deve ter no minimo 3 caracteres!"),
            email: yup.string().required("o campo email é obbrigatorio!").email(),
        })
        //verificar se dados passaram na validação
        await schema.validate(data,{abortEarly:false})
        //pegar o repositorio da entidade users
        const userRepository = await AppDataSource.getRepository(User)
        //buscar registro especificado
        const user = await userRepository.findOne({
            where: {id: userId}
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
                id: Not(userId)
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
router.delete("/users/delete",verifyToken, async (req:AuthRequest, res:Response) => {
    try {
        //pegar id do usuario pela url
        const userId = req.user!.id
        //pegar repositorio da  entidade user
        const userRepository = await AppDataSource.getRepository(User)
        //verificar se o usuario existe
        const existUser = await userRepository.findOne({
            where: {id: userId}
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
            message: `erro ao deletar o usuario : ${error}`
        })
    }
})

//criar rota somente para EDITAR A SENHA VERBO PUT
router.put("/users/users-password/:id", async (req: Request, res:Response) =>{
    try {
        // pegar os dados que vem pela URL
        const {id} = req.params
        //pegar os dados do corpo
        const data = req.body 
        //fazer verificação com yup
        const schema = yup.object().shape({
            password: yup.string().required("o campo senha é obrigatorio").min(6, "o campo deve ter pelo menos 6 caracteres")
        })
        //verificar se passou pela verificação
        await schema.validate(data, {abortEarly: false})
        //obeter repositorio da entidade users
        const userRepository = AppDataSource.getRepository(User)
        //verificar se algum usuario existe com o id captado da URL
        const user = await userRepository.findOneBy({id:parseInt(id as string)})

        if(!user) {
            res.status(404).json({
                message: "usuario não encontrado!"
            })
            return
        }

        //metodo de criptografia implementado dentro da entidade
        //criptografar a senha
        //data.password = await bcrypt.hash(data.password, 10)
        
        //realizar a alteração do registro
        userRepository.merge(user, data)
        // salvar a alteração
        const updatPassword = await userRepository.save(user)
        //retornar mensagem de sucesso 
        res.status(200).json({
            message: "senha atualizada com sucesso!",
            user: updatPassword
        })
        
    } catch (error:any) {
        //verifica se teve erro na validação 
        if(error instanceof yup.ValidationError){
            res.status(400).json({
                message:error.errors
            })
        }
        //retorna mensagem de erro
        res.status(500).json({
            message: "não foi possivel atualizar a senha do usuario, tente novamente"
        })
    }
} )

//criar rota para RESETAR a senha 
//dados em forma de objeto 
/*
{
    "password": "senha atual"
    "newPassword": "nova senha"
    "confirmNewPassword": "nova senha"
} 
*/
router.put("/users/reset-password", verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        //pegar id do usuario pela url
        const userId = req.user!.id
        //pegar os dados do corpo
        const data = req.body 
        //fazer verificação com yup
        const schema = yup.object().shape({
            atualPassword: yup.string().required("o campo senha é obrigatorio").min(6, "o campo deve ter pelo menos 6 caracteres"),
            newPassword: yup.string().required("o campo nova senha é obrigatorio").min(6, "o campo deve ter pelo menos 6 caracteres"),
            confirmPassword: yup.string().oneOf([yup.ref("newPassword")],"A confirmação da senha não corresponde à nova senha").required("necessario confirmar a senha").min(6, "o campo deve ter pelo menos 6 caracteres"),
        })
        //verificar se passou pela verificação
        await schema.validate(data, {abortEarly: false})
        //obeter repositorio da entidade users
        const userRepository = AppDataSource.getRepository(User)
        //verificar se algum usuario existe com o id captado pelo token
        const user = await userRepository.findOneBy({id:userId})
        //verificar se a senha encaminhada é igual a cadastrada no banco
        const passwordMatch = await bcrypt.compare(data.atualPassword, user!.password)

        //metodo de criptografia implementado dentro da entidade
        //criptografar a senha
        //data.password = await bcrypt.hash(data.password, 10)

        //verificar se a senha no banco é igual a senha encaminhada
        if(!passwordMatch) {
            res.status(400).json({
                message: "A senha atual digitada está incorreta"
            })
            return
        }

        //colocar a nova senha do usuario 
        user!.password = data.newPassword
        // salvar a alteração
        const updatPassword = await userRepository.save(user!)
        //retornar mensagem de sucesso 
        res.status(200).json({
            message: "senha atualizada com sucesso!",
            user: updatPassword
        })
        
    } catch (error:any) {
        //verifica se teve erro na validação 
        if(error instanceof yup.ValidationError){
            res.status(400).json({
                message:error.errors
            })
        }
        //retorna mensagem de erro
        res.status(500).json({
            message: `não foi possivel atualizar a senha do usuario, tente novamente ${error}`
        })
    }
})

//exportar
export default router