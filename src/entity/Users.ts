import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, OneToMany} from "typeorm"
//importa a entidade Transactions
import { Transaction } from "./Transactions"
//importa a entidade Category
import { Category } from "./Categories"

import { FinancialGoals } from "./FinancialGoals"

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!:number

    @Column()
    name!: string

    @Column({unique: true})
    email!: string

    @Column()
    password!: string

    @Column()
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

}