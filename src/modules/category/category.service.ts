import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { DeepPartial, Not, Repository } from 'typeorm';
import { S3Service } from '../s3/s3.service';
import { isBoolean, toBoolean } from 'src/common/utility/function.util';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utility/pagination.util';
import { FolderImage } from 'src/common/enum/folder-image.enum';

@Injectable()
export class CategoryService {

  constructor(
    @InjectRepository(CategoryEntity) private categoryRepository: Repository<CategoryEntity>,
    private s3Service: S3Service
  ) { }

  async create(createCategoryDto: CreateCategoryDto, image: Express.Multer.File) {
    const { Location, Key } = await this.s3Service.uploadFile(image, FolderImage.snappfoodImage)
    let { title, parentId, show, slug } = createCategoryDto
    const category = await this.findOneBySlug(slug)
    if (category) throw new ConflictException('already exist category')
    if (isBoolean(show)) {
      show = toBoolean(show)
    }
    let parent: any = null
    if (parentId && !isNaN(parentId)) {
      parent = await this.findOneById(+parentId)
    }
    await this.categoryRepository.insert({
      title,
      show,
      slug,
      image: Location,
      imageKey: Key,
      parentId: parent?.id
    })
    return {
      message: "create category success!"
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto)
    const [categories, count] = await this.categoryRepository.findAndCount({
      where: {},
      relations: {
        parent: true
      },
      select: {
        parent: {
          title: true
        }
      },
      skip,
      take: limit,
      order: { id: "DESC" }
    })
    return {
      pagination: paginationGenerator(count, page, limit),
      categories,
      count
    }
  }

  async findOneById(id: number) {
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) throw new NotFoundException("category not found")
    return category
  }

  async findOneBySlug(slug: string) {
    return await this.categoryRepository.findOneBy({ slug })
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, image?: Express.Multer.File) {
    const { title, parentId, show, slug } = updateCategoryDto
    let category = await this.findOneById(id)
    const updateObject: DeepPartial<CategoryEntity> = {}
    if (image) {
      const { Location, Key } = await this.s3Service.uploadFile(image, FolderImage.snappfoodImage)
      if (Location) {
        updateObject['image'] = Location
        updateObject['imageKey'] = Key
        await this.s3Service.deleteFile(category?.imageKey)
      }
    }
    if (title) updateObject['title'] = title
    if (isBoolean(show)) updateObject['show'] = toBoolean(show)
    if (slug) {
      const category = await this.findOneBySlug(slug)
      if (category && category.id !== id) throw new ConflictException('already exist category')
      updateObject['slug'] = slug
    }
    if (parentId && !isNaN(parseInt(parentId.toString()))) {
      let category = await this.findOneById(id)
      if (!category) throw new NotFoundException("category not found")
      updateObject['parentId'] = category.id

    }

    await this.categoryRepository.update(id, updateObject)
    return {
      message: "update category success!"
    }

  }

  async remove(id: number) {
    const category = await this.findOneById(id)
    await this.categoryRepository.remove(category)
    return {
      message: "remove category success!"
    }
  }
}
