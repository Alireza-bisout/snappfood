import { Column, Entity, OneToOne } from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { SupplierEntity } from "./supplier.entity";
import { EntityNames } from "src/common/enum/entity-name.enum";

@Entity(EntityNames.SupplierOTP)
export class SupplierOTPEntity extends BaseEntity {
    @Column()
    code: string

    @Column()
    expires_in: Date

    @Column({ nullable: true })
    supplierId: number

    @OneToOne(() => SupplierEntity, supplier => supplier.otp, { onDelete: 'CASCADE' })
    supplier: SupplierEntity
}