import { DamageRelations } from '../../domain/pokemon/pokemon-type.entity';

export interface TypeFetcher {
  execute(typeName: string): Promise<DamageRelations | null>;
}
