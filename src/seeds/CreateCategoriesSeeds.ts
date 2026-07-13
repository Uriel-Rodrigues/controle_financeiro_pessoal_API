//importar conção com o banco 
import { DataSource } from "typeorm";
//importar entidade gategories
import { Category } from "../entity/Categories";
//importar o enum da entidade categories
import { CategoryTypes } from "../entity/Categories";
//importar entidade User 
import { User } from "../entity/Users";

export default class CreateCategoriesSeed {
    public async run(dataSource: DataSource): Promise <void> {
        //mensagem de inicio da seed
        console.log("iniciando seed para popupar entidade categories...")
        //pegar repositorio das entidades
        const categoriesRepository = await dataSource.getRepository(Category)
        const userRepository = await dataSource.getRepository(User)
        //veificar se existem registros na entidade
        const contCategories = await categoriesRepository.count() 
        //para processo caso existam registros
        if(contCategories > 0){
            console.log("entidade categories ja possui registros, nenhum novo registro foi adicionado")
            return
        }
        //bustar um user na entidade Users
        const existUser = await userRepository.findOne({where: {id:1}}) 
        //retornar mensagem caso nao seja encontrada
        if(!existUser){
            console.log("erro: nenhum usuario encontrado com ID 1. verifique se a tabela 'users' esta populada")
            return
        }
        //criar registros de usuario 
        const categories = [
            {
                name: "salario", 
                type: CategoryTypes.INCOME,
                users: existUser
            },
            {
                name: "lazer", 
                type: CategoryTypes.EXPENSE,
                users: existUser
            },
            {
                name: "transporte", 
                type: CategoryTypes.EXPENSE,
                users: existUser
            },
            {
                name: "investimentos", 
                type: CategoryTypes.INCOME,
                users: existUser
            },
            {
                name: "salario2", 
                type: CategoryTypes.INCOME,
                users: existUser
            },
            {
                name: "gás", 
                type: CategoryTypes.EXPENSE,
                users: existUser
            },
            {
                name: "internet", 
                type: CategoryTypes.EXPENSE,
                users: existUser
            },
        ]
        //salvar novos registro
        await categoriesRepository.save(categories) 
        //retornar mensagem de sucesso
        console.log("seed concluida com sucesso: Categorias cadastradas")
    }
}

