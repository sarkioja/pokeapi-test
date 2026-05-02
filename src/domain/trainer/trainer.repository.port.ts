import { Trainer } from './trainer.entity';

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

export interface AddressData {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface TrainerPage {
  data: Trainer[];
  total: number;
}

export const TRAINER_REPOSITORY = 'TRAINER_REPOSITORY';

export interface TrainerRepositoryPort {
  create(data: CreateTrainerData): Promise<Trainer>;
  findById(id: string): Promise<Trainer | null>;
  findByEmail(email: string): Promise<Trainer | null>;
  findAll(limit: number, offset: number): Promise<TrainerPage>;
  update(id: string, data: UpdateTrainerData): Promise<Trainer>;
  updateAddress(id: string, address: AddressData): Promise<Trainer>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<Trainer>;
  existsActiveByEmail(email: string, excludeId?: string): Promise<boolean>;
}
