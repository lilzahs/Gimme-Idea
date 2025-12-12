import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateFeedDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateFeedDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class AddFeedItemDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;
}
