import { Controller, Get, Module } from '@nestjs/common';
import { CATEGORIES } from '../products/categories';

@Controller('site')
class SiteController {
  @Get()
  info() {
    const e = process.env;
    return {
      name: e.SITE_NAME || 'Jugnu',
      whatsapp: e.SITE_WHATSAPP || '923000000000',
      phone: e.SITE_PHONE || '+92 300 0000000',
      email: e.SITE_EMAIL || 'info@jugnutextiles.pk',
      address: e.SITE_ADDRESS || 'Main Ichra Bazaar, Ferozepur Road, Lahore, Pakistan',
      categories: CATEGORIES,
    };
  }

  @Get('health')
  health() {
    return { ok: true };
  }
}

@Module({ controllers: [SiteController] })
export class SiteModule {}
