import {Repository, ObjectLiteral, FindOptionsOrder} from 'typeorm'

//criar uma interface
interface PaginationResult<T> {
    error: boolean,
    data: T[],
    currentPage: number,
    lastPage: number,
    totalRecord: number,
    relations?: string[]
}

//definir uma classe de serviço para implementar a logica de paginação
export class PaginationService {
    //metodo que realiza a paginação em qualquer repositorio 
    static async paginate <T extends ObjectLiteral> (
        repository: Repository<T>,
        page: number = 1,
        limit: number = 3,
        order: FindOptionsOrder<T> = {},
        relations?: string[]
    ):Promise <PaginationResult <T>>{
        //consta o total de registros no repositorio para determinar a quantidade total de paginas
        const totalRecord = await repository.count()
        //calcular o numero da ultima pagina baseado no total de registros e no limite de registros por pagina
        const lastPage = Math.ceil(totalRecord/limit) 
        //verificar se a pagina solicitada e valida; se não for, lançar um erro
        if(page > lastPage && lastPage > 0){
            throw new Error (`pagina invalida total de paginas: ${lastPage}`)
        }
        //calcular o offcet (a partir de qual registro começa a busca)
        const offset = (page - 1) * limit
        //buscar os registros do repositorio  com base no limite, offset e ordem de classificação
        const data = await repository.find({
            take: limit,
            skip: offset,
            order: order,
            relations: relations // usar os relacionametos passados dinamicamente (1 ou mais tabelas)
        })
        //retornar o resultado da paginação em um format estruturado
        return {
            error: false,
            data: data,
            currentPage: page,
            lastPage: lastPage,
            totalRecord: totalRecord
        }
    }
}