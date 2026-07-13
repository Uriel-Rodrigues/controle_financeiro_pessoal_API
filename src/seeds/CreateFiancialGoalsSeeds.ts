//importar conção com o banco 
import { DataSource } from "typeorm";
//importar entidade User 
import { User } from "../entity/Users";
// importar entidade FinancialGoals
import { FinancialGoals } from "../entity/FinancialGoals";
// importar enum type de financialGoals
import { FinancialGoalsStatus} from "../entity/FinancialGoals";

export default class CreateFinancialGoalsSeed {
    public async run(dataSource: DataSource): Promise <void> {
        //mensagem de inicio da seed
        console.log("iniciando seed para popupar entidade financialGoals...")
        //pegar repositorio das entidades
        const financialGoalRepository = await dataSource.getRepository(FinancialGoals)
        const userRepository = await dataSource.getRepository(User)
        //verifica se nao existe nenhum reistro
        const financialGoals = await financialGoalRepository.count()
        
        if(financialGoals > 0) {
            console.log("entidade financialGoals ja possui registros, nenhum novo registro foi adicionado")
        } 
        //procurar registro na tabela user
        const user = await userRepository.findOne( {where: { id:1 } } )
        //retornar mensagem caso nao encontrado
        if(!user) {
            console.log("erro: nenhum usuario encontrado com ID 1. verifique se a tabela 'users' esta populada")
            return
        }
        //criar registros para financialGoals
        const financialGoalsRegistros = [
            {
                title: "100 mil",
                description: "conseguir 100 mil investidos",
                target_amount: 1000000,
                current_amount: 20000,
                target_date: "2027-02-20",
                status: FinancialGoalsStatus.ACTIVE,
                users: user
            },
            {
                title: "aplicar em ações",
                description: "aplicar 30000 em açoes",
                target_amount: 30000,
                current_amount: 5000,
                target_date: "2027-02-20",
                status: FinancialGoalsStatus.COMPLETED,
                users: user
            },
            {
                title: "renda extra ",
                description: "conseguir resda extra",
                target_amount: 5000,
                current_amount: 0,
                target_date: "2027-02-20",
                status: FinancialGoalsStatus.ACTIVE,
                users: user
            },
            {
                title: "redusir gastos",
                description: "reduir gastos em 1000",
                target_amount: 1000,
                current_amount: 200,
                target_date: "2027-02-20",
                status: FinancialGoalsStatus.ACTIVE,
                users: user
            },
            {
                title: "imoveis",
                description: "10000 em imoveis",
                target_amount: 10000,
                current_amount: 3000,
                target_date: "2027-02-20",
                status: FinancialGoalsStatus.COMPLETED,
                users: user
            },
            {
                title: "20000 variados investidos",
                description: " 20000 investidos",
                target_amount: 20000,
                current_amount: 5000,
                target_date: "2027-02-20",
                status: FinancialGoalsStatus.ACTIVE,
                users: user
            }
        ]
        //salvar registros
        await financialGoalRepository.save(financialGoalsRegistros)
        //retornar mensagem de sucesso
        console.log("seed concluida com sucesso: Financial goals cadastradas") 
    }
}