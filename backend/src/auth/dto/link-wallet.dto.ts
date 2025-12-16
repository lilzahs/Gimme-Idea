import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class LinkWalletDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  signedPayload?: string; // For passkey wallets (WebAuthn)

  @IsOptional()
  @IsBoolean()
  isPasskey?: boolean; // Flag to indicate passkey wallet
}
