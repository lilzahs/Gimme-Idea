import {
    IsString,
    IsOptional,
    IsUUID,
    IsBoolean,
    IsInt,
    Min,
    Max,
    MaxLength,
} from "class-validator";

// =============================================
// TEAM DTOs
// =============================================

export class CreateTeamDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsInt()
    @Min(2)
    @Max(10)
    maxMembers?: number = 5;

    @IsOptional()
    @IsBoolean()
    isOpen?: boolean = false;
}

export class UpdateTeamDto {
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
    avatarUrl?: string;

    @IsOptional()
    @IsInt()
    @Min(2)
    @Max(10)
    maxMembers?: number;

    @IsOptional()
    @IsBoolean()
    isOpen?: boolean;
}

// =============================================
// INVITE DTOs
// =============================================

export class InviteToTeamDto {
    @IsUUID()
    inviteeId: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    message?: string;
}

export class RespondToInviteDto {
    @IsString()
    action: "accept" | "reject";
}

// =============================================
// QUERY DTOs
// =============================================

export class QueryTeamsDto {
    @IsOptional()
    @IsString()
    hackathonId?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsBoolean()
    isOpen?: boolean;

    @IsOptional()
    limit?: number = 20;

    @IsOptional()
    offset?: number = 0;
}

// =============================================
// RESPONSE INTERFACES
// =============================================

export interface TeamMember {
    id: string;
    oderId: string;
    username: string;
    avatar?: string;
    role: "leader" | "member";
    joinedAt: string;
}

export interface HackathonTeam {
    id: string;
    hackathonId: string;
    name: string;
    description?: string;
    avatarUrl?: string;
    leaderId: string;
    maxMembers: number;
    memberCount: number;
    isOpen: boolean;
    isFull: boolean;
    createdAt: string;
    updatedAt: string;
    // Populated
    leader?: {
        id: string;
        username: string;
        avatar?: string;
    };
    members?: TeamMember[];
}

export interface TeamInvite {
    id: string;
    teamId: string;
    teamName: string;
    inviterId: string;
    inviterName: string;
    inviteeId: string;
    inviteeName: string;
    status: "pending" | "accepted" | "rejected" | "expired";
    message?: string;
    createdAt: string;
    expiresAt: string;
}
