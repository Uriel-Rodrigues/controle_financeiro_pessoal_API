//importar a biblioteca express
import express, {Request, Response} from "express";
// importar coneçao com o banco 
import { AppDataSource } from "../data-source";

//criar aplicação express
const router = express.Router()

//iniciar conecção com banco de dados
AppDataSource.initialize()
    .then(()=> {
        console.log("conexão com o banco de dados realizada com sucesso")
    })
    .catch((error) => {
        console.log("erro na conexão com o banco de dados:", error)
    })
    
//criar rota get principal
router.get("/", (req:Request, res:Response) =>{
    res.send("oi meu chapa")
})

//exportar
export default router