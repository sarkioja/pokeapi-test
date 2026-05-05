import { Team, TeamStatus } from './team.entity';

export interface CreateTeamData {
  name: string;
  trainerId: string;
}

export interface UpdateTeamData {
  name?: string;
  status?: TeamStatus;
}

export interface TeamPage {
  data: Team[];
  total: number;
}

export interface TeamRepositoryPort {
  create(data: CreateTeamData): Promise<Team>;
  findById(id: string): Promise<Team | null>;
  findByIdWithPokemon(id: string): Promise<Team | null>;
  findByTrainerId(trainerId: string, limit: number, offset: number): Promise<TeamPage>;
  update(id: string, data: UpdateTeamData): Promise<Team>;
  softDelete(id: string): Promise<void>;
  softDeleteByTrainerId(trainerId: string): Promise<void>;
  addPokemon(teamId: string, pokemonId: string, slot: number, nickname?: string): Promise<void>;
  removePokemon(teamId: string, slotId: string): Promise<void>;
}
