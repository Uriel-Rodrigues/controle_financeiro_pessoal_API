//importar a biblioteca express
import express, {Request, Response} from "express";
// importar seviço de sutenticação, responsavel por validar o login do usuario
import { AuthService } from "../Services/AuthService";  
//importar sistema de validadção de dados yup
import * as yup from "yup"
//importar biblioteca para gerar a chave recuperar senha
import crypto from "crypto"
//importar biblioteca para criptografar senha 
import bcrypt from "bcryptjs"
//importar conecção com o banco de dados
import { AppDataSource } from "../data-source";
// importar entidade que vai ser usada
import { User } from "../entity/Users";
//importar biblioteca para enviar email
import nodemailer from "nodemailer"
//importar middleware de autenticação para validar token
import { verifyToken } from "../middleware/authMiddleware";

//criar aplicação express
const router = express.Router()

//criar rota para validar o login
//dados em forma de objeto
/*
{
    "email":"user@email.com"
    "password":"12345678"
}
*/

router.post("/login", async (req: Request, res: Response) => {
    try {
        //capturar os dados que vem pelo corpo
        const {email, password}= req.body 
        // verificar se os dados foram encaminhados
        if(!email || !password) {
            res.status(400).json({
                message: "email e senha são obrigatorios!"
            })
            return
        }
        //criar uma instancia do serviço de autenticação
        const authService = new AuthService()

        //chamar o metodo login para validar as credenciais e obter os dados do usuario
        const userData = await authService.login(email, password)

        //retorna mensagem de sucesso 
        res.status(200).json({
            message:"login realizado com sucesso!",
            user: userData
        })
        
        //finalizar o bloco try
        return

    } catch (error: any) {
        //retornar menssagem em caso de erro
        res.status(401).json({
        message: error.message || `erro ao realizar o login: ${error}` 
        })
        return
    }
})


//criar rota para validar o token 
//enviar o bearer token do usuario logado, 
//exemplo: bearer <colocar-o-token-gerado-com-jwt>
router.get("/validate-token", verifyToken, (req: Request, res:Response) => {
    res.status(200).json({
        menssage: "token valido!",
        userId: (req as any).user.id //o id do usuario autenticado 
    })
})


//criar rota publica para cadastrar o usuario 
//dados em formato de objeto
/*
{
    "name":"cesar",
    "email": "userEmail@email.com.br",
    "password": "123456A#s"
}
*/
router.post("/users", async (req: Request, res: Response) => {
    try {
        //receber os dados que vem no corpo da requisição
        var data = req.body 
        //fazer validação usando yup
        const schema = yup.object().shape({
            name: yup
            .string().required("o campo nome é obrigatorio!").min(3, "o nome deve ter no minimo 3 caracteres para ser valido"),
            email: yup.string().required("o campo email é obrigatorio!").email(),
            password: yup.string().required("o campo senha é obrigatorio!").min(6, "o campo deve ter no minimo 6 caracteres!"),
        })
        //verificar de os dados passaram pela validação
        await schema.validate(data, {abortEarly: false}) 
        //capiturar repositorio 
        const userRepository = AppDataSource.getRepository(User)
        //bucar no repositorio um registro com o mesmo email
        const user = await userRepository.findOne({
            where: {email: data.email} 
        })
        //verificar se existe um registro com mesmo email
        if(user){
            res.status(201).json({
                menssage: "Nome de usuario em uso, tente outro"
            })
        }
        // //criptografar a senha antes de salvar
        // data.password = await bcrypt.hash(data.password,10)

        //criar um novo registro 
        userRepository.create(data)
        //salvar o registro
        const newUser = await userRepository.save(userRepository.create(data))
        //resposta de sucesso
        res.status(201).json({
            menssage: "novo usuario cadastrado com sucesso",
            user: newUser
        })

    }
    catch (error: any){
       if(error instanceof yup.ValidationError){
            res.status(400).json({
                menssage: error.errors
            })
            return
        }
        //retorna resposta de erro
        console.log(error);
        res.status(500).json({
            menssage: "erro ao cadastrar usuario"
        })
    }
})

//criar rota para recuperar a senha  
//dados em forma de objeto
/*
{
    "urlRecoverPassword":"http://localhost",
    "email": "usuario@email.com.br"
} 
*/ 
router.post("/recover-password", async (req:Request, res:Response ) => {
    try{
        //capturar os dados do corpo da requisição
        const data = req.body
        //validar os dados pelo yupe
        const schema = yup.object().shape({
            urlRecoverPassword: yup
                .string()
                .required("o campo nome é obrigatorio!")
                .min(3, "o nome deve ter no minimo 3 caracteres para ser valido"),
            email: yup
                .string()
                .required("o campo email é obrigatorio!")
                .email(),
        })
        //verificar se os dados passaram pela validação
        await schema.validate(data,{abortEarly:false})
        //pegar o repositorio da entidade user
        const userRepository = AppDataSource.getRepository(User)
        //verificar se existe o usuario dentro do banco pelo email
        const existUser = await userRepository.findOneBy({email:data.email})
        //verificar se os dados foram encontrados
        if(!existUser) {
            res.status(404).json({
                menssage: "Usuario não encontrado!"
            })
            return
        } 

        //gerar um token seguro de 65 caractes (recoverPassword- coluna no banco)
        existUser.recoverPassword = await crypto.randomBytes(32).toString("hex")

        //salvar as alterações no banco incluindo o recoverPassword
        await userRepository.save(existUser) 

        //Criar a variaveis com as credencias do servidor para enviar email
        //(documentação nodemailer)
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        //criar variavel com conteudo do email
        //(documentação nodemailer)
        var menssage_content = {
            from: process.env.EMAIL_FROM, // sender address
            to: data.email, // list of recipients
            subject: "Recuperar Senha", // subject line

            text: `presado ${existUser.name}\n\n informamos que sua solicitação de alteração de senha foi recebida com sucesso. \n\n clique ou copie o link para criar uma nova senha em nosso sistema: ${data.urlRecoverPassword}?email=${data.email}&key=${existUser.recoverPassword} \n\n esta mensagem foi encaminhada pela empresa ${process.env.APP}.`, // conteudo do email somente texto
            
            html:`presado ${existUser.name}<br><br> informamos que sua solicitação de alteração de senha foi recebida com sucesso. <br><br> clique ou copie o link para criar uma nova senha em nosso sistema: <a href='${data.urlRecoverPassword}?email=${data.email}&key=${existUser.recoverPassword}'>${data.urlRecoverPassword}?email=${data.email}&key=${existUser.recoverPassword}</a> <br><br> esta mensagem foi encaminhada pela empresa ${process.env.APP}.`, // conteudo do email em HTML
        };

        //enviar email
        transporter.sendMail(menssage_content, function (erro){
            if(erro){
                //retornar resposta de erro 
                res.status(200).json({
                    menssage: `email não enviado, tente novamente ou contate ${process.env.EMAIL_ADM}`
                })
                return
            }
            else{
                //retorna resposta de sucesso
                res.status(200).json({
                    menssage:"email encaminhado com sucessso verifique sua caixa de entrada",
                    urlRecoverPassword: `${data.urlRecoverPassword}?email=${data.email}&key=${existUser.recoverPassword}`
                    })
                }
                return
            })
    }
    catch(error: any){
        //retorna menssagem em cado de erro de validação
        if (error instanceof yup.ValidationError){
            res.status(400).json({
                menssage: error.errors
            })
            return
        }
        //retorna erro em caso de falha
        res.status(500).json({
            menssage: "erro ao editar registro de usuario"
        })
    }
})

//criar rota para validar a chave para recuperar a senha 
//dados em forma de objeto
/*
{
    "recoverPassword":"chave-recuperar-senha",
    "email": "usuario@email.com.br"
}
*/
router.post("/validate-recover-password", async (req: Request, res: Response) => {
    try {
        //pegar os dados que vem da requisição 
        const data = req.body
        //validar os dados usando a biblioteca yup
        const schema = yup.object().shape({
            recoverPassword: yup.string().required("a chave é obrigatoria!"),
            email: yup.string().email("E-mail obrigatorio!").required("o email é obrigatorio")
        })
        //verificar se os dados recebidos passaram na verificação
        await schema.validate(data,{abortEarly:false})
        //capturar repositorio do usuario 
        const userRepository = AppDataSource.getRepository(User)
        //verificar se o usuario existe dentro do banco de dados
        const existUser = userRepository.findOneBy({email:data.email, recoverPassword: data.recoverPassword})

        if(!existUser) {
            //retornar mensagem de não encontrado 
            res.status(404).json({
                menssage: "chave para recuperar senha invalida!"
            })
        }
        //retornar mensagem de sucesso 
        res.status(200).json({
            menssage:"chave para alterar senha valida!"
        })
        return
    }
    catch (error:any){
        //verificar se possui erro na validação
        if (error instanceof yup.ValidationError) {
            res.status(400).json({
                menssage:error.errors
            })
            return
        }
        //encaminhar menssagem generica de erro 
        res.status(401).json({
            menssage:"chave de autenticação de senha invalida!"
        })

    }
})

//criar rota para atualizar a senha e apagar achave do banco 
//dados em forma de objeto
/*
{
    "recoverPassword":"chave-recuperar-senha",
    "email": "usuario@email.com.br"
    "password": "123456A#s"
}
*/
router.put("/update-password", async (req: Request, res: Response) => {
    try{
        //captar os dados quem vem do corpo da requisição
        const data = req.body
        //validar dados recebidos com yup
        const schema = yup.object().shape({
            recoverPassword: yup.string().required("a chave é necessaria!"),
            email: yup.string().email("email é obrigatorio!").required("o campo email é obrigatorio!"),
            password: yup.string().required("obrigatorio fornecer a nova senha").min(6, "o campo deve ter no minimo 6 caracteres")
        })
        //verificar se os dados passaram na verificação
        await schema.validate(data,{abortEarly:false})
        //obter o repositorio da entidade user
        const userRepository = await AppDataSource.getRepository(User)
        //verificar se o usuario realmente existe no banco de dados
        const existUser = await userRepository.findOneBy({email:data.email, recoverPassword:data.recoverPassword})
        //verificar se o usuario foi encontrado
        if(!existUser){
            res.status(404).json({
                menssage: "usuario não encontrado!"
            })
            return
        }
        //verificar se a nova senha é igual a antiga
        const mesmaSenha = await bcrypt.compare(data.password, existUser.password)
        if (mesmaSenha){
            res.status(401).json({
                menssage: "a nova senha não pode ser igual a antiga!"
            })
            return
        }
        //deletar a chave de verificação gravada dentro do banco de dados
        data.recoverPassword = null
        //atualizar os dados no banco de dados
        userRepository.merge(existUser, data)
        //salvar os dados no banco
        await userRepository.save(existUser)

        //mensagem de sucesso 
        res.status(200).json({
            menssage: "senha atualizada com sucesso!"
        })
    }
    catch (error:any){
        if(error instanceof yup.ValidationError){
            res.status(401).json({
                menssage: error.errors
            })
            return
        }
    //encaminhar mensagem generica de erro 
    res.status(401).json({
        menssage: "Erro senha não atualizada!"
    })
    }
}) 

export default router