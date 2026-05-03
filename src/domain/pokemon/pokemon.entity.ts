export class Pokemon {
  constructor(
    public readonly id: string,
    public readonly pokeapiId: number,
    public name: string,
    public spriteUrl: string | null,
    public types: string[],
    public baseExperience: number | null,
    public height: number | null,
    public weight: number | null,
    public fetchedAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
