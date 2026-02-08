import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Not, Repository } from 'typeorm';
import { S3Service } from '../s3/s3.service';
import { isBoolean, toBoolean } from 'src/common/utility/function.util';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utility/pagination.util';

@Injectable()
export class CategoryService {

  constructor(
    @InjectRepository(CategoryEntity) private categoryRepository: Repository<CategoryEntity>,
    private s3Service: S3Service
  ) { }

  async create(createCategoryDto: CreateCategoryDto, image: Express.Multer.File) {
    const { Location } = await this.s3Service.uploadFile(image, "snappfood-image")
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

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
