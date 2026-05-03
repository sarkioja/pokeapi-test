import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ViaCepPort } from '../../../domain/ports/viacep.port';
import { AddressData } from '../../../domain/shared/address-data';
import {
  CepNotFoundExternalException,
  ExternalServiceException,
} from '../../../domain/exceptions/external-service.exception';
import { ViaCepResponseDto } from './dto/viacep-response.dto';

@Injectable()
export class ViaCepClient implements ViaCepPort {
  private readonly logger = new Logger(ViaCepClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    this.http = axios.create({
      baseURL: config.get<string>('VIACEP_BASE_URL', 'https://viacep.com.br/ws'),
      timeout: config.get<number>('HTTP_TIMEOUT_MS', 5000),
    });
  }

  async lookup(cep: string): Promise<AddressData> {
    let data: ViaCepResponseDto;

    try {
      const response = await this.http.get<ViaCepResponseDto>(`/${cep}/json/`);
      data = response.data;
    } catch (err) {
      this.logger.error(`ViaCEP request failed for CEP ${cep}`, err);
      throw new ExternalServiceException('ViaCEP', (err as Error).message);
    }

    if (data.erro) {
      throw new CepNotFoundExternalException(cep);
    }

    return {
      cep: data.cep.replace(/\D/g, ''),
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    };
  }
}
