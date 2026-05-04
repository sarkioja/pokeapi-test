import { DuplicatePokemonException } from '../exceptions/duplicate-pokemon.exception';
import { TeamArchivedException } from '../exceptions/team-archived.exception';
import { TeamFullException } from '../exceptions/team-full.exception';
import { TeamPokemon } from '../team-pokemon/team-pokemon.entity';
import { Team } from './team.entity';

const makeSlot = (pokemonId: string, slot: number): TeamPokemon =>
  new TeamPokemon(`slot-${slot}`, 'team-1', pokemonId, slot, null, new Date());

const makeTeam = (
  overrides: Partial<{ status: 'active' | 'archived'; pokemon: TeamPokemon[] }> = {},
): Team =>
  new Team(
    'team-1',
    'Dream Team',
    overrides.status ?? 'active',
    'trainer-1',
    overrides.pokemon ?? [],
    new Date(),
    new Date(),
  );

describe('Team', () => {
  describe('assertCanAddPokemon', () => {
    it('rejects archived teams', () => {
      const team = makeTeam({ status: 'archived' });

      expect(() => team.assertCanAddPokemon('p-1')).toThrow(TeamArchivedException);
    });

    it('rejects teams that already have the maximum size', () => {
      const team = makeTeam({ pokemon: [1, 2, 3, 4, 5].map((i) => makeSlot(`p-${i}`, i)) });

      expect(() => team.assertCanAddPokemon('p-6')).toThrow(TeamFullException);
    });

    it('rejects duplicated pokemon', () => {
      const team = makeTeam({ pokemon: [makeSlot('p-1', 1)] });

      expect(() => team.assertCanAddPokemon('p-1')).toThrow(DuplicatePokemonException);
    });
  });

  describe('assertCanReceivePokemon', () => {
    it('rejects archived teams before a pokemon is resolved', () => {
      const team = makeTeam({ status: 'archived' });

      expect(() => team.assertCanReceivePokemon()).toThrow(TeamArchivedException);
    });
  });

  describe('nextAvailableSlot', () => {
    it('returns the first gap in the team slots', () => {
      const team = makeTeam({ pokemon: [makeSlot('p-2', 1), makeSlot('p-3', 3)] });

      expect(team.nextAvailableSlot()).toBe(2);
    });
  });
});
