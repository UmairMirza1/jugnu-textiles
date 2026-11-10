import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

/** Protects admin endpoints with a shared token sent in the `x-admin-token` header. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const expected = process.env.ADMIN_TOKEN;
    const given = ctx.switchToHttp().getRequest().headers['x-admin-token'];
    if (!expected || typeof given !== 'string') throw new UnauthorizedException();
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException();
    return true;
  }
}
