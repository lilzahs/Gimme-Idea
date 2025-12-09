import { IsString, IsNotEmpty, IsEmail, IsOptional } from "class-validator";

export class EmailLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  authId: string; // Supabase Auth User ID

  @IsString()
  @IsOptional()
  username?: string;
}
