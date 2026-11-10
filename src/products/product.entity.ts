import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export interface ProductSize { size: string; retail: number; wholesale: number }
export interface ProductPattern { type: 'solid' | 'stripe' | 'check' | 'floral' | 'dots' | 'geometric'; colors: string[] }

@Entity('products')
export class Product {
  /** Article / SKU code, e.g. JT-101 */
  @PrimaryColumn() id: string;
  @Column() name: string;
  @Column({ default: '' }) nameUr: string;
  @Column() category: string;
  @Column() fabric: string;
  @Column({ type: 'int', default: 0 }) threadCount: number;
  @Column({ default: '' }) finish: string;
  @Column({ type: 'text', default: '' }) description: string;
  @Column({ type: 'jsonb' }) pattern: ProductPattern;
  @Column({ type: 'jsonb' }) sizes: ProductSize[];
  /** Minimum wholesale order quantity (pieces) */
  @Column({ type: 'int', default: 12 }) moq: number;
  @Column({ type: 'varchar', nullable: true }) badge: string | null;
  /** Optional photo URL; when empty the site draws an illustration from `pattern` */
  @Column({ type: 'varchar', nullable: true }) imageUrl: string | null;
  @Column({ default: true }) inStock: boolean;
  @Column({ default: true }) active: boolean;
  @Column({ type: 'int', default: 0 }) sortOrder: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
