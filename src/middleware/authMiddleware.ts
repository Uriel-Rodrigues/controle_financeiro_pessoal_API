//importar a biblioteca express
import express, {Request, Response, NextFunction} from "express"
//importar a biblioteca para manipular tokens
import jwt from "jsonwebtoken"
//importar variaveis de embiente
import dotenv from "dotenv"
//carregar as variaveis do arquivo
dotenv.config()

//criar uma interface para receber o id do usuatio 
export interface AuthRequest extends Request {
    user?: {id: number}
}

/**
 * Middleware para validar o token de autenticação JWT
 * @param req - objto da requisição
 * @para res - objeto da resposta
 * @param next - função para passar o controle para o proximo middleware
 */

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void{
    //obter o token do cabeçalho da requisição 
    const authHeader = req.headers.authorization

    //verificar se o cabeçalho contem um token 
    if(!authHeader) {
        res.status(401).json({
            menssage: "é necessario realizar login para acessar essa pagina"
        })
        return
    }

    //separar o token do prefixo "Bearer"
    const [bearer, token] = authHeader.split(" ")

    //verificar se o token foi fornecido corretamente
    if(!token || bearer.toLowerCase() !== "bearer" ) {
        res.status(401).json({
            menssage: "token inválido"
        })
        return
    }
    try{
        // verificar e decodificar token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {id: number}
        //atribuir o ID do usaurio autenticado à requisição para usu posterior 
        req.user = {id: decoded.id}
        //passar o controle para a proxima função na rota
        next()
    }
    catch{
        res.status(401).json({
            menssage: "token invalido ou expirado"
        })
    }
}