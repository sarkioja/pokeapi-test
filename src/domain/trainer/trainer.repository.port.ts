import { Trainer } from './trainer.entity';
import { AddressData } from '../shared/address-data';

export interface CreateTrainerData {
  name: string;
  email: string;
  favoritePokeapiId?: number;
}

export interface UpdateTrainerData {
  name?: string;
  email?: string;
  favoritePokeapiId?: number;
}

export interface TrainerPage {
  data: Trainer[];
  total: number;
}

export interface TrainerRepositoryPort {
  create(data: CreateTrainerData): Promise<Trainer>;
  findById(id: string): Promise<Trainer | null>;
  findWithDeletedById(id: string): Promise<Trainer | null>;
  findByEmail(email: string): Promise<Trainer | null>;
  findAll(limit: number, offset: number): Promise<TrainerPage>;
  update(id: string, data: UpdateTrainerData): Promise<Trainer>;
  updateAddress(id: string, address: AddressData): Promise<Trainer>;
  softDelete(id: string): Promise<void>;
  softDeleteWithTeams(id: string): Promise<void>;
  restore(id: string): Promise<Trainer>;
  restoreWithTeams(id: string): Promise<Trainer>;
  existsActiveByEmail(email: string, excludeId?: string): Promise<boolean>;
}
