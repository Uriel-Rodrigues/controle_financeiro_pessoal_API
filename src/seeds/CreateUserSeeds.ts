//importar conexão com o banco de dados 
import { DataSource } from "typeorm";
//importar a entidae user 
import { User } from "../entity/Users";
//importa biblioteca para criptografar senha
import bcrypt from "bcryptjs"

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
                password: await bcrypt.hash("12345678",10)
            },
            {
                name: "luiza",
                email: "luiza@email.com",
                password: await bcrypt.hash("12345678",10)
            },
            {
                name: "jessica",
                email: "jessica@email.com",
                password: await bcrypt.hash("12345678",10)
            },
            {
                name: "luana",
                email: "luana@email.com",
                password: await bcrypt.hash("12345678",10)
            },
            {
                name: "veronica",
                email: "veronica@email.com",
                password: await bcrypt.hash("12345678",10)
            },
            {
                name: "lara",
                email: "lara@email.com",
                password: await bcrypt.hash("12345678",10)
            },
            {
                name: "fernanda",
                email: "fernanda@email.com",
                password: await bcrypt.hash("12345678",10)
            },
            {
                name: "luan",
                email: "luan@email.com",
                password: await bcrypt.hash("12345678",10)
            },
            {
                name: "jacson",
                email: "jacson@email.com",
                password: await bcrypt.hash("12345678",10)
            }
        ]
        //salvar os registros 
        await userRepository.save(users)
        //retornar mensagem de sucesso 
        console.log("seed concluida com sucesso: Usuarios cadastrados")
    }
}