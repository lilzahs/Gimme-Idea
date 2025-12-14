export class CreateHackathonDto {
  slug: string;
  title: string;
  description: string;
  startDate: string; // ISO Date
  endDate: string;   // ISO Date
  prizePool: string;
  imageUrl?: string;
  tags?: string[];
  timeline?: any[]; // JSONB
  tracks?: any[];   // JSONB
  config?: any;     // JSONB
}

export class CreateTeamDto {
  name: string;
  description: string;
  tags: string[];
  lookingFor: string[];
  maxMembers: number;
}

export class JoinTeamDto {
  teamId: string;
}

export class SubmitProjectDto {
  projectId: string; // Existing idea ID
  track: string;
  hackathonId: string;
}
