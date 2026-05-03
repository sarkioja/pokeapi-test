export class Trainer {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public cep: string | null,
    public addressStreet: string | null,
    public addressNeighborhood: string | null,
    public addressCity: string | null,
    public addressState: string | null,
    public addressCountry: string | null,
    public favoritePokeapiId: number | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
