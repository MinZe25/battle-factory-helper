import {Injectable} from '@angular/core';
import {IPokemonService} from "./IPokemonService";
import {Pokemon, PokemonSet} from "../Models/Pokemon";
import * as dbData from "../Databases/db.json";
import {group} from "@angular/animations";
import {FrontierLevel} from "../Algorithms/BattleFactoryGen3Algorithm";

@Injectable({
    providedIn: 'root'
})
export class PokemonService extends IPokemonService {
    private readonly group1: Pokemon[];
    private readonly group2: Pokemon[];
    private readonly group3: Pokemon[];
    private readonly allGroups: Pokemon[];
    private readonly allNames: string[];
    private readonly initialRentalPokemonRange: Pokemon[][][];

    constructor() {
        super();

        function parsePokemon(group: number): Pokemon[] {
            const data = group == 1 ? dbData["Group 1"] : group == 2 ? dbData["Group 2"] : dbData["Group 3"];
            return data.map(x =>
                new Pokemon(
                    x["Species"],
                    Number.parseInt(x["Instance"]),
                    [x["Move 1"], x["Move 2"], x["Move 3"], x["Move 4"]],
                    (x["Type"] as string)?.split(","),
                    x["Item"] as string,
                    x["Possible Ability"] as string,
                    x["Entry"])
            );
        }


        this.group1 = parsePokemon(1);
        this.group2 = parsePokemon(2);
        this.group3 = parsePokemon(3);
        this.allGroups = [...this.group1, ...this.group2, ...this.group3]

        function removeDuplicates(arr: string[]): string[] {
            return arr.reduce(function (acc: string[], curr) {
                if (!acc.includes(curr))
                    acc.push(curr);
                return acc;
            }, []);
        }

        this.allNames = removeDuplicates(this.allGroups.map(x => x.specie));
        this.initialRentalPokemonRange = [
            [
                this.allGroups.slice(110, 199 + 1),
                this.allGroups.slice(162, 266 + 1),
                this.allGroups.slice(267, 371 + 1),
                this.allGroups.slice(372, 467 + 1),
                this.allGroups.slice(468, 563 + 1),
                this.allGroups.slice(564, 659 + 1),
                this.allGroups.slice(660, 755 + 1),
                this.allGroups.slice(372, 849 + 1)
            ],
            [
                this.allGroups.slice(372, 467 + 1),
                this.allGroups.slice(468, 563 + 1),
                this.allGroups.slice(564, 659 + 1),
                this.allGroups.slice(660, 755 + 1),
                this.allGroups.slice(372, 881 + 1),
                this.allGroups.slice(372, 881 + 1),
                this.allGroups.slice(372, 881 + 1),
                this.allGroups.slice(372, 881 + 1)
            ]
        ];
    }

    override getPokemonFromGroup(level: FrontierLevel, round: number): Pokemon[] {
        return this.initialRentalPokemonRange[Number(level)][Math.min(7, round - 1)];
    }

    override getPokemonFromEntry(entry: number): Pokemon {
        return this.allGroups[entry - 1];
    }

    override getAllPokemonFromSpecie(specie: string): Pokemon[] {
        return this.allGroups.filter(x => x.specie.toLowerCase() === specie.toLowerCase());
    }

    override getAllPokemonNames(): string[] {
        return this.allNames;
    }
}
