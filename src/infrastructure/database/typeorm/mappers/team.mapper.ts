import { Team, TeamStatus } from '../../../../domain/team/team.entity';
import { TeamPokemon } from '../../../../domain/team-pokemon/team-pokemon.entity';
import { TeamOrmEntity } from '../entities/team.orm-entity';
import { TeamPokemonOrmEntity } from '../entities/team-pokemon.orm-entity';
import { PokemonMapper } from './pokemon.mapper';

export class TeamMapper {
  static teamPokemonToDomain(orm: TeamPokemonOrmEntity): TeamPokemon {
    return new TeamPokemon(
      orm.id,
      orm.teamId,
      orm.pokemonId,
      orm.slot,
      orm.nickname,
      orm.addedAt,
      orm.pokemon ? PokemonMapper.toDomain(orm.pokemon) : undefined,
    );
  }

  static toDomain(orm: TeamOrmEntity): Team {
    const pokemon = (orm.teamPokemon ?? []).map(TeamMapper.teamPokemonToDomain);
    return new Team(
      orm.id,
      orm.name,
      orm.status as TeamStatus,
      orm.trainerId,
      pokemon,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
