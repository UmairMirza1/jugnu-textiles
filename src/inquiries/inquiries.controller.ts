import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto, UpdateInquiryDto } from './inquiry.dto';
import { AdminGuard } from '../common/admin.guard';
import { InquiryStatus } from './inquiry.entity';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiries.create(dto);
  }
}

@Controller('admin/inquiries')
@UseGuards(AdminGuard)
export class AdminInquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Get() list(@Query('status') status?: InquiryStatus) { return this.inquiries.list(status); }
  @Get('stats') stats() { return this.inquiries.stats(); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInquiryDto) { return this.inquiries.update(id, dto); }
}
