import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, OneToMany} from "typeorm"
//importa a entidade Transactions
import { Transaction } from "./Transactions"
//importa a entidade Category
import { Category } from "./Categories"
//importa entidade financialGoals
import { FinancialGoals } from "./FinancialGoals"
//importa biblioteca para criptografar senha
import bcrypt from "bcryptjs"

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!:number

    @Column({type: "varchar", length: 150, unique:true})
    name!: string

    @Column({unique: true})
    email!: string

    @Column()
    password!: string

    @Column({unique:true})
    recoverPassword!: string

    
    //relacionameto OneToMany com a tabela Transactions
    //usuario -----E transações
    @OneToMany(() => Transaction, (transaction) => transaction.users)
    transactions!: Transaction[] 

    //relacionameto OneToMany com a tabela categories
    //usuario -----E categories
    @OneToMany(() => Category, (category) => category.users )
    categories!: Category

    //relacionameto OneToMany com a tabela financialGoals
    //usuario -----E financialGoals
    @OneToMany(() => FinancialGoals, (financialGoals) => financialGoals.users)
    financialGoals!: FinancialGoals


    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created_at!: Date;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate:"CURRENT_TIMESTAMP"})
    updated_at!: Date;

    //metodo para comparar a senha informada pelo usuario com a senha armazenada no banco de dados 
    async comparePassword(password:string):Promise<boolean> {
        //comparar a senha enviada pela requisição com a senha criptografada no banco 
        return bcrypt.compare(password, this.password)
    }

}