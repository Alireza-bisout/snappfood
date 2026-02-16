import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityNames } from "src/common/enum/entity-name.enum";
import { Entity  } from "typeorm";
import { Column } from "typeorm";


@Entity(EntityNames.SupplierDocumentsForTests)
export class SupplierDocumentsForTestsEntity extends BaseEntity {
    @Column({ nullable: true })
    image: string | null

    @Column({ nullable: true })
    documents: string | null

    @Column()
    supplierId: number

}
