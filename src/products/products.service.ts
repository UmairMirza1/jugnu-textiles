import { ConflictException, Injectable, NotFoundException, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { SEED_PRODUCTS } from './seed';

@Injectable()
export class ProductsService implements OnApplicationBootstrap {
  private readonly log = new Logger(ProductsService.name);
  constructor(@InjectRepository(Product) private readonly repo: Repository<Product>) {}

  /** Seed the catalog on first boot so the site is never empty. */
  async onApplicationBootstrap() {
    if ((await this.repo.count()) === 0) {
      await this.repo.save(SEED_PRODUCTS.map((p, i) => this.repo.create({ ...p, sortOrder: i })));
      this.log.log(`Seeded ${SEED_PRODUCTS.length} products`);
    }
  }

  findPublic(category?: string) {
    return this.repo.find({
      where: { active: true, ...(category ? { category } : {}) },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
  }

  async findOne(id: string, includeInactive = false) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p || (!includeInactive && !p.active)) throw new NotFoundException('Product not found');
    return p;
  }

  async create(dto: CreateProductDto) {
    if (await this.repo.exist({ where: { id: dto.id } })) throw new ConflictException(`Article ${dto.id} already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateProductDto) {
    const p = await this.findOne(id, true);
    Object.assign(p, dto);
    return this.repo.save(p);
  }

  async remove(id: string) {
    const p = await this.findOne(id, true);
    await this.repo.remove(p);
    return { deleted: id };
  }
}
