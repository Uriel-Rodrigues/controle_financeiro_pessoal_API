import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from "typeorm"
//importa a entidade user 
import { User } from "./Users"
import { Transaction } from "./Transactions"

//cria um tipo de dado enum com valores predefinidos
export enum CategoryTypes{
    INCOME= "income",
    EXPENSE = "expense"
}

@Entity("categories")
export class Category{

    @PrimaryGeneratedColumn()
    id!: number

    @Column({type: "varchar", length: 150})
    name!: string

    @Column({type: "enum", enum: CategoryTypes })
    type!: CategoryTypes

    //relacionameto ManyToOne com a tabela users
    //User 3----- Category
    @ManyToOne(() => User, (user) => user.categories)
    users!: User

    //relacionamento OneToMany com a tabela transaction
    @OneToMany(() => Transaction, (transaction) => transaction.categories)
    transactions!: Transaction


    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created_at!: Date;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate:"CURRENT_TIMESTAMP"})
    updated_at!: Date;
}