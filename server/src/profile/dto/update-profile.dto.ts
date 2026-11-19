import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ProfileTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  professional_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;
}

export class ProfileTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileTranslationFieldsDto)
  ar?: ProfileTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileTranslationFieldsDto)
  tr?: ProfileTranslationFieldsDto;
}

export class ProfileCvFileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(400)
  file!: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  professional_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(300)
  linkedin_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(300)
  github_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  photo_path?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  photo_alt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ProfileCvFileDto)
  cv_files?: ProfileCvFileDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileTranslationsDto)
  translations?: ProfileTranslationsDto;
}
