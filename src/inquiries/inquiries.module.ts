import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquiry } from './inquiry.entity';
import { InquiriesService } from './inquiries.service';
import { AdminInquiriesController, InquiriesController } from './inquiries.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry]), ProductsModule],
  providers: [InquiriesService],
  controllers: [InquiriesController, AdminInquiriesController],
})
export class InquiriesModule {}
