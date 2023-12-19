import {Pokemon} from "../Models/Pokemon";
import {FrontierLevel} from "../Algorithms/BattleFactoryGen3Algorithm";

export abstract class IPokemonService {
    abstract getPokemonFromGroup(level: FrontierLevel, round: number): Pokemon[];

    abstract getPokemonFromEntry(entry: number): Pokemon;

    abstract getAllPokemonFromSpecie(specie: string): Pokemon[];

    abstract getAllPokemonNames(): string[];
}
