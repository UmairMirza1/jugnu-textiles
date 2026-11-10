import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { CATEGORY_IDS } from './categories';

class SizeDto {
  @IsString() @MaxLength(60) size: string;
  @IsInt() @Min(0) retail: number;
  @IsInt() @Min(0) wholesale: number;
}
class PatternDto {
  @IsIn(['solid', 'stripe', 'check', 'floral', 'dots', 'geometric']) type: 'solid' | 'stripe' | 'check' | 'floral' | 'dots' | 'geometric';
  @IsArray() @ArrayMinSize(1) @Matches(/^#[0-9a-fA-F]{6}$/, { each: true }) colors: string[];
}

export class CreateProductDto {
  @Matches(/^[A-Z0-9-]{2,20}$/) id: string;
  @IsString() @MaxLength(120) name: string;
  @IsOptional() @IsString() @MaxLength(120) nameUr?: string;
  @IsIn(CATEGORY_IDS) category: string;
  @IsString() @MaxLength(80) fabric: string;
  @IsOptional() @IsInt() @Min(0) threadCount?: number;
  @IsOptional() @IsString() @MaxLength(60) finish?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ValidateNested() @Type(() => PatternDto) pattern: PatternDto;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => SizeDto) sizes: SizeDto[];
  @IsOptional() @IsInt() @Min(1) moq?: number;
  @IsOptional() @IsString() @MaxLength(30) badge?: string | null;
  @IsOptional() @IsString() @MaxLength(500) imageUrl?: string | null;
  @IsOptional() @IsBoolean() inStock?: boolean;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(120) nameUr?: string;
  @IsOptional() @IsIn(CATEGORY_IDS) category?: string;
  @IsOptional() @IsString() @MaxLength(80) fabric?: string;
  @IsOptional() @IsInt() @Min(0) threadCount?: number;
  @IsOptional() @IsString() @MaxLength(60) finish?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @ValidateNested() @Type(() => PatternDto) pattern?: PatternDto;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => SizeDto) sizes?: SizeDto[];
  @IsOptional() @IsInt() @Min(1) moq?: number;
  @IsOptional() @IsString() @MaxLength(30) badge?: string | null;
  @IsOptional() @IsString() @MaxLength(500) imageUrl?: string | null;
  @IsOptional() @IsBoolean() inStock?: boolean;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}
