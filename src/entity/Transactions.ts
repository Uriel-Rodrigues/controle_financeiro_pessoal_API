import {Entity ,PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne } from "typeorm"
//importa a entidade Users para ser usada no relacionamento 
import { User } from "./Users"
//importa a entidade category para ser usada no relacionamento 
import { Category } from "./Categories"

export enum transactionType{
    INCOME = "income",
    EXPENSE = "expense"
}

@Entity("transactions")
export class Transaction {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({type: "enum", enum: transactionType})
    type!: transactionType

    @Column({type: "varchar", length: 255})
    description!: string

    @Column({type:"decimal", precision:10, scale: 2})
    amount!: number

    @Column({type: "date"})
    transation_date!: Date

    @Column({type: "varchar", length: 255, nullable:true})
    observations?: string


    // relacionamento ManyToOne com a tabela Users
    // Transactions 3----- usuario 
    @ManyToOne(() => User, (user) => user.transactions)
    users!: User

    // relacionamento ManyToOne com a tabela Category
    // Transactions 3----- category 
    @ManyToOne(() => Category, (category) => category.transactions)
    categories!: Category

    
    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created_at!: Date;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate:"CURRENT_TIMESTAMP"})
    updated_at!: Date;


}