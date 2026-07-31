//importar conecção com o banco de dados
import { AppDataSource } from "../data-source";
//importar bbiblioteca para manipular token 
import jwt from "jsonwebtoken"
// importar entidade que vai ser usada
import { User } from "../entity/Users";
//importar variaveis de embiente
import dotenv from "dotenv"
//carregar as variaveis do arquivo
dotenv.config()

//classe responsavel pela autrenticação do usuario 
export class AuthService {

    //criar um repositorio para manipular a tabela user
    private userRepository = AppDataSource.getRepository(User)

    /**
     * Metodo para autenticar um usuario com e-mail e senha
     * @param email - email do usuario
     * @param password - senha do usuario 
     * @retuns - dados do usuario autentidados e token de acesso 
     * @throws - erro caso as credenciais sejam invalidas
     */

    async login(email:string, password:string): Promise<{id:number; name:string; email:string; token:string}> {

        //buscar o usuario no banco de daos pelo email informado
        const user = await this.userRepository.findOne({where: {email:email}})

        // se o usuario não for encontrado lançar um erro 
        if(!user) {
            throw new Error("Usuario ou senha invalidos!")
        }

        //verificar se a senha encaminhada corresponde a senha no banco 
        const isPasswordValid = await user.comparePassword(password)

        if(!isPasswordValid) {
            throw new Error ("Usuario ou senha invalidos!")
        }

        //gerar um token JWT (jasonwebtoken) para o usuario autenticado 
        //o token inclui o ID do usuario e expira em 7 dias
        const token = jwt.sign({id:user.id},process.env.JWT_SECRET as string, {expiresIn: "7d"})

        //retornar os dados do usuario autenticado junto com o token gerado 
        return {id: user.id, name: user.name, email: user.email, token }
    }
}