import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { Inquiry, InquiryLine, InquiryStatus } from './inquiry.entity';
import { CreateInquiryDto, UpdateInquiryDto } from './inquiry.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(Inquiry) private readonly repo: Repository<Inquiry>,
    private readonly products: ProductsService,
  ) {}

  /** Prices are always recalculated from the database — never trusted from the browser. */
  private async priceLines(lines: CreateInquiryDto['items'] = []): Promise<InquiryLine[]> {
    const out: InquiryLine[] = [];
    for (const l of lines) {
      const p = await this.products.findOne(l.productId).catch(() => null);
      if (!p) throw new BadRequestException(`Unknown article ${l.productId}`);
      const s = p.sizes.find((x) => x.size === l.size);
      if (!s) throw new BadRequestException(`Size "${l.size}" not available for ${p.id}`);
      const wholesale = l.qty >= p.moq;
      const unitPrice = wholesale ? s.wholesale : s.retail;
      out.push({ productId: p.id, name: p.name, size: s.size, qty: l.qty, unitPrice, priceType: wholesale ? 'wholesale' : 'retail', lineTotal: unitPrice * l.qty });
    }
    return out;
  }

  private makeReference() {
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `JT-${ymd}-${randomInt(1000, 9999)}`;
  }

  async create(dto: CreateInquiryDto) {
    const { website, items, ...rest } = dto;
    if (website) return { reference: 'OK', items: [], estimatedTotal: 0 }; // silently drop bots
    if (dto.type === 'order' && !items?.length) throw new BadRequestException('Your order list is empty');
    const lines = await this.priceLines(items);
    const estimatedTotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const saved = await this.repo.save(this.repo.create({ ...rest, items: lines, estimatedTotal, reference: this.makeReference() }));
        return { reference: saved.reference, items: saved.items, estimatedTotal: saved.estimatedTotal };
      } catch (e: any) {
        if (e?.code !== '23505') throw e; // retry only on duplicate reference
      }
    }
    throw new BadRequestException('Could not save, please try again');
  }

  list(status?: InquiryStatus) {
    return this.repo.find({ where: status ? { status } : {}, order: { createdAt: 'DESC' }, take: 500 });
  }

  async update(id: number, dto: UpdateInquiryDto) {
    const i = await this.repo.findOne({ where: { id } });
    if (!i) throw new NotFoundException();
    Object.assign(i, dto);
    return this.repo.save(i);
  }

  async stats() {
    const rows: { status: string; count: string; total: string }[] = await this.repo
      .createQueryBuilder('i')
      .select('i.status', 'status').addSelect('COUNT(*)', 'count').addSelect('COALESCE(SUM(i.estimatedTotal),0)', 'total')
      .groupBy('i.status').getRawMany();
    return rows.map((r) => ({ status: r.status, count: Number(r.count), total: Number(r.total) }));
  }
}
