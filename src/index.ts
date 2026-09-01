//importar a biblioteca express
import express, {Request, Response} from "express"
//importar variaveis de embiente
import dotenv from "dotenv"
//carregar as variaveis do arquivo
dotenv.config()
//imortar biblioteca para permitir requisições externas 
import cors from 'cors'



//criar aplicação Express
const app = express()

//criar o middleware para receber os dados no corpo da requisição
app.use(express.json())
// criar middleware para permitir requisições externas
app.use(cors())

// importas as controllers
import usersController from "./controllers/usersController"
import transactionsController from "./controllers/transactionsController"
import categoriesController from "./controllers/categoriesController"
import financialGoalsController from "./controllers/financialGoalsController"
import TestConnectionController from "./controllers/TestConnectionController"
import authController from "./controllers/authController"
import reportsController from "./controllers/reportsController"
//criar rotas
app.use('/', usersController)
app.use('/', transactionsController)
app.use('/', categoriesController)
app.use('/', financialGoalsController)
app.use('/', TestConnectionController)
app.use('/', authController)
app.use('/', reportsController)

//criar rota get principal
app.get("/", (req: Request, res: Response) => {
    res.send("bem vindo meu chapa!")
})


//iniciar o servidor na porta definida na variavel de ambiente
app.listen(8080, () => {
    console.log(`srvidor iniciado na porta ${process.env.PORT}: http://localhost:${process.env.PORT}`)
});