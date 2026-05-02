import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { PokeApiPort, PokeApiPokemonData } from '../../../domain/ports/pokeapi.port';
import { DamageRelations } from '../../../domain/pokemon/pokemon-type.entity';
import {
  ExternalServiceException,
  ResourceNotFoundException,
} from '../../../domain/exceptions/external-service.exception';
import {
  PokeApiPokemonResponseDto,
  PokeApiTypeResponseDto,
} from './dto/pokeapi-pokemon-response.dto';

@Injectable()
export class PokeApiClient implements PokeApiPort {
  private readonly logger = new Logger(PokeApiClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    this.http = axios.create({
      baseURL: config.get<string>('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2'),
      timeout: config.get<number>('HTTP_TIMEOUT_MS', 5000),
    });
  }

  async fetchPokemonByName(name: string): Promise<PokeApiPokemonData> {
    return this.fetchPokemon(`/pokemon/${name.toLowerCase()}`);
  }

  async fetchPokemonById(pokeapiId: number): Promise<PokeApiPokemonData> {
    return this.fetchPokemon(`/pokemon/${pokeapiId}`);
  }

  async fetchTypeEffectiveness(typeName: string): Promise<DamageRelations> {
    let data: PokeApiTypeResponseDto;

    try {
      const response = await this.http.get<PokeApiTypeResponseDto>(`/type/${typeName}`);
      data = response.data;
    } catch (err) {
      this.logger.error(`PokéAPI type request failed for "${typeName}"`, err);
      throw new ExternalServiceException('PokéAPI', (err as Error).message);
    }

    const dr = data.damage_relations;
    return {
      doubleDamageTo: dr.double_damage_to.map((t) => t.name),
      halfDamageTo: dr.half_damage_to.map((t) => t.name),
      noDamageTo: dr.no_damage_to.map((t) => t.name),
      doubleDamageFrom: dr.double_damage_from.map((t) => t.name),
      halfDamageFrom: dr.half_damage_from.map((t) => t.name),
      noDamageFrom: dr.no_damage_from.map((t) => t.name),
    };
  }

  private async fetchPokemon(path: string): Promise<PokeApiPokemonData> {
    let data: PokeApiPokemonResponseDto;

    try {
      const response = await this.http.get<PokeApiPokemonResponseDto>(path);
      data = response.data;
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      if (status === 404) throw new ResourceNotFoundException('Pokémon', path.split('/').pop()!);
      this.logger.error(`PokéAPI request failed: ${path}`, err);
      throw new ExternalServiceException('PokéAPI', (err as Error).message);
    }

    return {
      pokeapiId: data.id,
      name: data.name,
      spriteUrl: data.sprites.front_default,
      types: data.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
      baseExperience: data.base_experience,
      height: data.height,
      weight: data.weight,
    };
  }
}
