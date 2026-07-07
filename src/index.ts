//importar a biblioteca express
import express, {Request, Response} from "express"
//importar variaveis de embiente
import dotenv from "dotenv"

//carregar as variaveis do arquivo
dotenv.config()

//criar aplicação Express
const app = express()

//criar o middleware para receber os dados no corpo da requisição
app.use(express.json())

// importas as controllers
import usersController from "./controllers/usersController"
import transactionsController from "./controllers/transactionsController"
import categoriesController from "./controllers/categoriesController"

//criar rotas
app.use('/', usersController)
app.use('/', transactionsController)
app.use('/', categoriesController)

//criar rota get principal
app.get("/", (req: Request, res: Response) => {
    res.send("bem vindo meu chapa!")
})


//iniciar o servidor na porta definida na variavel de ambiente
app.listen(8080, () => {
    console.log(`srvidor iniciado na porta ${process.env.PORT}: http://localhost:${process.env.PORT}`)
});