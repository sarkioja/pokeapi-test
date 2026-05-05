import { Team } from '../../../domain/team/team.entity';
import { TeamRepositoryPort } from '../../../domain/team/team.repository.port';
import { TrainerRepositoryPort } from '../../../domain/trainer/trainer.repository.port';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';

export class CreateTeamUseCase {
  constructor(
    private readonly teamRepository: TeamRepositoryPort,
    private readonly trainerRepository: TrainerRepositoryPort,
  ) {}

  async execute(name: string, trainerId: string): Promise<Team> {
    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) throw new ResourceNotFoundException('Trainer', trainerId);
    return this.teamRepository.create({ name, trainerId });
  }
}
