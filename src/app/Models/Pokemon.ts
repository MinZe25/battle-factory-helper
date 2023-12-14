import {PokemonType} from "../Algorithms/BattleFactoryGen3Algorithm";

export class Pokemon {
  constructor(specie: string, set: number, moves: string[], types: PokemonType[], item: string = "", ability: string = "") {
    this.specie = specie;
    this.set = set;
    this.moves = moves;
    this.item = item;
    this.types = types;
    this.ability = ability;
  }

  public specie: string;
  public set: number;
  public moves: string[];
  public item: string;
  public types: PokemonType[];
  public ability: string;

  public isComplete(): boolean {
    return this.moves.filter(x => x!!).length === 4 &&
      !!this.item &&
      !!this.ability;
  }
}

export class PokemonSet {
  public pokemons: Pokemon[];

  constructor() {
    this.pokemons = [];
  }
}
