import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
//importa a entidade users
import { User } from "./Users"

export class ColumnNumericTansformer{
    to(data: number): number{
        return data
    }
    from(data: string): number{
        return parseFloat(data)
    }
}

export enum FinancialGoalsStatus {
    ACTIVE = "active",
    COMPLETED ="completed"
}

@Entity("financialGoals")
export class FinancialGoals {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar", length: 150 })
    title!: string

    @Column({ type: "varchar", length: 300})
    description!: string

    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTansformer()
    })
    target_amount!: number

    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTansformer()
    })
    current_amount!: number

    @Column({type: "date"})
    target_date!: Date

    @Column({type: "enum", enum: FinancialGoalsStatus})
    status!: FinancialGoalsStatus

    //relcaionamento ManyToOne com a tabela users
    //FiancialGoals 3----- user
    @ManyToOne(() => User, (user) => user.financialGoals)
    users!: User


    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    created_at!: Date;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate:"CURRENT_TIMESTAMP"})
    updated_at!: Date;


}