import { Module } from '@nestjs/common';
import { ViaCepClient } from './viacep.client';
import { VIACEP_PORT } from '../../../domain/ports/viacep.port';

@Module({
  providers: [{ provide: VIACEP_PORT, useClass: ViaCepClient }],
  exports: [VIACEP_PORT],
})
export class ViaCepModule {}
