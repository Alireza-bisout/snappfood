import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityNames } from "src/common/enum/entity-name.enum";
import { Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityNames.UserAddress)
export class UserAddressEntity extends BaseEntity {
    @Column()
    title: string

    @Column()
    province: string

    @Column()
    city: string

    @Column()
    address: string

    @Column({ nullable: true })
    postal_code: string

    @Column()
    userId: number

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date

    @ManyToOne(() => UserEntity, user => user.addressList, { onDelete: "CASCADE" })
    user = UserEntity
}