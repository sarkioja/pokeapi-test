import { InvalidCepException } from '../../exceptions/invalid-cep.exception';

export class CepVO {
  private static readonly CEP_REGEX = /^\d{8}$/;

  static validate(cep: string): string {
    const normalized = cep.replace(/\D/g, '');
    if (!CepVO.CEP_REGEX.test(normalized)) {
      throw new InvalidCepException(cep);
    }
    return normalized;
  }
}
