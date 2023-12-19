import {PokemonType} from "../Algorithms/BattleFactoryGen3Algorithm";

export class Pokemon {
    constructor(specie: string, set: number, moves: string[], types: string[], item: string = "", ability: string = "", entry: string) {
        this.specie = specie;
        this.set = set;
        this.entry = entry;
        this.moves = moves.filter(x => x !== "---");
        this.item = item;
        this.types = types.map(x => x as any);
        this.ability = ability;
    }
    private entry: string;
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

    constructor(pokemons: Pokemon[] = []) {
        this.pokemons = pokemons;
    }
}
