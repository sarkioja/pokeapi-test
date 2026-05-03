import { Trainer } from '../../../../domain/trainer/trainer.entity';
import { TrainerOrmEntity } from '../entities/trainer.orm-entity';

export class TrainerMapper {
  static toDomain(orm: TrainerOrmEntity): Trainer {
    return new Trainer(
      orm.id,
      orm.name,
      orm.email,
      orm.cep,
      orm.addressStreet,
      orm.addressNeighborhood,
      orm.addressCity,
      orm.addressState,
      orm.addressCountry,
      orm.favoritePokeapiId,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
