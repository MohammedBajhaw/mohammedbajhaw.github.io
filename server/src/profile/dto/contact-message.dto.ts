import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { ContactMessageStatus } from '../schemas/contact-message.schema';

const CONTACT_STATUSES: readonly ContactMessageStatus[] = [
  'new',
  'read',
  'replied',
  'archived',
];

export class CreateContactMessageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  service?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message!: string;
}

export class UpdateContactStatusDto {
  @IsIn(CONTACT_STATUSES)
  status!: ContactMessageStatus;
}
