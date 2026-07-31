//importar a biblioteca express
import express, {Request, Response} from "express";
// importar seviço de sutenticação, responsavel por validar o login do usuario
import { AuthService } from "../Services/AuthService";  

//criar aplicação express
const router = express.Router()

//criar rota para validar o login
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
            menssage:"login realizado com sucesso!",
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

export default router