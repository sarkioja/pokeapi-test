export class ResourceNotFoundException extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`);
    this.name = this.constructor.name;
  }
}
