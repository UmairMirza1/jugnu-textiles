import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEmail, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { INQUIRY_STATUSES, INQUIRY_TYPES, InquiryStatus, InquiryType } from './inquiry.entity';

class LineDto {
  @IsString() @MaxLength(20) productId: string;
  @IsString() @MaxLength(60) size: string;
  @IsInt() @Min(1) @Max(100000) qty: number;
}

export class CreateInquiryDto {
  @IsIn(INQUIRY_TYPES) type: InquiryType;
  @IsString() @MinLength(2) @MaxLength(100) name: string;
  /** Pakistani or international phone: digits, spaces, +, - */
  @Matches(/^\+?[0-9][0-9\s-]{8,17}$/, { message: 'Please enter a valid phone number' }) phone: string;
  @IsOptional() @IsEmail() @MaxLength(120) email?: string;
  @IsOptional() @IsString() @MaxLength(60) city?: string;
  @IsOptional() @IsString() @MaxLength(120) businessName?: string;
  @IsOptional() @IsString() @MaxLength(40) customerType?: string;
  @IsOptional() @IsString() @MaxLength(3000) message?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => LineDto) items?: LineDto[];
  /** Honeypot: real users leave this empty */
  @IsOptional() @IsString() website?: string;
}

export class UpdateInquiryDto {
  @IsOptional() @IsIn(INQUIRY_STATUSES) status?: InquiryStatus;
  @IsOptional() @IsString() @MaxLength(5000) adminNotes?: string;
}
