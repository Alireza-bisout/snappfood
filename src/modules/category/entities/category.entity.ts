import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityNames } from "src/common/enum/entity-name.enum";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity(EntityNames.Category)
export class CategoryEntity extends BaseEntity {
    @Column()
    title: string

    @Column({ unique: true })
    slug: string

    @Column()
    image: string

    @Column()
    show: boolean

    @Column({ nullable: true })
    parentId: number

    @ManyToOne(() => CategoryEntity, category => category.children, { nullable: true, onDelete: "SET NULL" })
    parent: CategoryEntity

    @OneToMany(() => CategoryEntity, category => category.parent)
    children: CategoryEntity[]
}