export class ExternalServiceException extends Error {
  constructor(service: string, cause?: string) {
    super(`External service "${service}" is unavailable${cause ? `: ${cause}` : ''}`);
    this.name = this.constructor.name;
  }
}

export class CepNotFoundExternalException extends Error {
  constructor(cep: string) {
    super(`CEP "${cep}" not found`);
    this.name = this.constructor.name;
  }
}
