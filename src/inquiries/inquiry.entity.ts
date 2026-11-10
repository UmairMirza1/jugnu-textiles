import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const INQUIRY_TYPES = ['order', 'quote', 'contact'] as const;
export const INQUIRY_STATUSES = ['new', 'contacted', 'confirmed', 'in-production', 'dispatched', 'closed', 'cancelled'] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface InquiryLine {
  productId: string; name: string; size: string; qty: number;
  unitPrice: number; priceType: 'wholesale' | 'retail'; lineTotal: number;
}

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn() id: number;
  /** Human-friendly reference shared with the customer, e.g. JT-261111-4821 */
  @Column({ unique: true }) reference: string;
  @Column({ type: 'varchar' }) type: InquiryType;
  @Column({ type: 'varchar', default: 'new' }) status: InquiryStatus;
  @Column() name: string;
  @Column() phone: string;
  @Column({ default: '' }) email: string;
  @Column({ default: '' }) city: string;
  @Column({ default: '' }) businessName: string;
  /** retailer, wholesaler, hotel, hospital, exporter, individual … */
  @Column({ default: '' }) customerType: string;
  @Column({ type: 'text', default: '' }) message: string;
  @Column({ type: 'jsonb', default: () => "'[]'" }) items: InquiryLine[];
  @Column({ type: 'int', default: 0 }) estimatedTotal: number;
  @Column({ type: 'text', default: '' }) adminNotes: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
