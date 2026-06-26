//importar a biblioteca express
import express, {Request, Response} from "express"
//importar variaveis de embiente
import dotenv from "dotenv"

//carregar as variaveis do arquivo
dotenv.config()

//criar aplicação Express
const app = express()

// importas as controllers
import login from "./controllers/login"

//criar rotas
app.use('/', login)

//criar rota get principal
app.get("/", (req: Request, res: Response) => {
    res.send("bem vindo meu chapa!")
})


//iniciar o servidor na porta definida na variavel de ambiente
app.listen(8080, () => {
    console.log(`srvidor iniciado na porta ${process.env.PORT}: http://localhost:${process.env.PORT}`)
});