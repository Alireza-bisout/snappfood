import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityNames } from "src/common/enum/entity-name.enum";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserAddressEntity } from "./address.entity";

@Entity(EntityNames.User)
export class UserEntity extends BaseEntity {
    @Column({ nullable: true })
    first_name: string

    @Column({ nullable: true })
    last_name: string

    @Column({ unique: true })
    mobile: string

    @Column({ unique: true, nullable: true })
    email: string

    @Column({ unique: true })
    invite_code: number

    @Column({ default: 0 })
    score: number

    @Column({ nullable: true })
    agentId: number

    @OneToMany(() => UserAddressEntity, address => address.user)
    addressList: UserAddressEntity[]

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date
}
