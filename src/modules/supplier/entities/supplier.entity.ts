import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityNames } from "src/common/enum/entity-name.enum";
import { CategoryEntity } from "src/modules/category/entities/category.entity";
import { Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Column } from "typeorm";
import { SupplierOTPEntity } from "./supplier-otp.entity";
import { SupplierStatus } from "../enum/status.enum";

@Entity(EntityNames.Supplier)
export class SupplierEntity extends BaseEntity {
    @Column()
    phone: string

    @Column()
    manager_name: string;

    @Column()
    manager_family: string;

    @Column()
    store_name: string;

    @Column({ nullable: true })
    categoryId: number;

    @ManyToOne(() => CategoryEntity, category => category.suppliers, { onDelete: "SET NULL" })
    category: CategoryEntity;

    @Column()
    city: string

    @Column({ nullable: true })
    image: string | null

    @Column({ nullable: true })
    documents: string | null

    @Column()
    invite_code: string

    @Column({ nullable: true })
    natinoal_code: string

    @Column({ nullable: true })
    email: string

    @Column({ nullable: true, default: SupplierStatus.Registered })
    status: string

    @Column({ nullable: true })
    agentId: number | null

    @Column({ nullable: true, default: false })
    mobile_verify: boolean

    @ManyToOne(() => SupplierEntity, supplier => supplier.subsets)
    agent: SupplierEntity

    @OneToMany(() => SupplierEntity, supplier => supplier.agent)
    subsets: SupplierEntity[]

    @Column({ nullable: true })
    otpId: number

    @OneToOne(() => SupplierOTPEntity, otp => otp.supplier)
    @JoinColumn()
    otp: SupplierOTPEntity
}
