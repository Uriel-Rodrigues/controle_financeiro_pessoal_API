//importar conexão com o banco de dados 
import { DataSource } from "typeorm";
//importar a entidae user 
import { User } from "../entity/Users";

export default class CreateUserSeed{
    public async run(dataSource: DataSource): Promise <void>{
        //mensagem de inicio
        console.log ("iniciando seed para popupar entidade users...")
        // obter repositorio da entidade
        const userRepository = await dataSource.getRepository(User)
        //verificar se ja existem registros
        const existeData = await userRepository.count()
        //parar seed caso tabela na tenha registros
        if(existeData > 0){
            console.log("entidade users ja possui registros, nenhum novo registro foi adicionado")
            return 
        }
        //criar registros de usuarios
        const users = [
            {
                name: "amanda",
                email: "amanda@email.com",
                password: "12345678"
            },
            {
                name: "luiza",
                email: "luiza@email.com",
                password: "12345678"
            },
            {
                name: "jessica",
                email: "jessica@email.com",
                password: "12345678"
            },
            {
                name: "luana",
                email: "luana@email.com",
                password: "12345678"
            },
            {
                name: "veronica",
                email: "veronica@email.com",
                password: "12345678"
            },
            {
                name: "lara",
                email: "lara@email.com",
                password: "12345678"
            },
            {
                name: "fernanda",
                email: "fernanda@email.com",
                password: "12345678"
            },
            {
                name: "luan",
                email: "luan@email.com",
                password: "12345678"
            },
            {
                name: "luana",
                email: "luana@email.com",
                password: "12345678"
            }
        ]
        //salvar os registros 
        await userRepository.save(users)
        //retornar mensagem de sucesso 
        console.log("seed concluida com sucesso: Usuarios cadastrados")
    }
}