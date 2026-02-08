import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityNames } from "src/common/enum/entity-name.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, UpdateDateColumn } from "typeorm";
import { UserAddressEntity } from "./address.entity";
import { OTPEntity } from "./otp.entity";

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

    @Column({ unique: true, nullable: true })
    invite_code: number

    @Column({ default: 0 })
    score: number

    @Column({ nullable: true })
    agentId: number

    @Column({ nullable: true, default: false })
    mobile_verify: boolean

    @OneToMany(() => UserAddressEntity, address => address.user)
    addressList: UserAddressEntity[]

    @Column({ nullable: true })
    otpId: number

    @OneToOne(() => OTPEntity, otp => otp.user)
    @JoinColumn()
    otp: OTPEntity

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date
}
