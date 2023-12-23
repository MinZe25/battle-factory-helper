import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {Pokemon, PokemonPercentage, PokemonSet} from "./Models/Pokemon";
import {
  Algorithm,
  BattleFactoryGen3Algorithm,
  BattleStyle,
  FrontierLevel,
  PokemonType, PokemonTypes
} from "./Algorithms/BattleFactoryGen3Algorithm";
import {IPokemonService} from "./services/IPokemonService";
import {FormsModule} from "@angular/forms";
import {PokemonInputComponent} from "./components/pokemon-input/pokemon-input.component";
import {PokemonNameSelectorComponent} from "./components/pokemon-name-selector/pokemon-name-selector.component";
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {groupBy} from "rxjs";
import {createObject} from "rxjs/internal/util/createObject";
import {
  PokemonPercentageSummaryComponent
} from "./components/pokemon-percentage-summary/pokemon-percentage-summary.component";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, PokemonInputComponent, PokemonNameSelectorComponent, MatCardModule, MatInputModule, MatSelectModule, PokemonPercentageSummaryComponent, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pokemonBattleFactoryApp';
  public pokemon: Pokemon[]
  public totalPokemonSets?: PokemonSet[]
  public pokemonSets?: PokemonPercentage[]
  public algorithm: Algorithm;
  public str?: string;
  enemy1: Pokemon = new Pokemon("Heracross", 1, ['', '', '', ''], [], "", "", "");
  enemy2: Pokemon = new Pokemon("Latias", 1, ['', '', '', ''], [], "", "", "");
  enemy3: Pokemon = new Pokemon("", 1, ['', '', '', ''], [], "", "", "");
  public enemy2Percentage?: PokemonPercentage[];
  public enemy1Percentage?: PokemonPercentage[];
  public enemy3Percentage?: PokemonPercentage[];
  party1?: string;
  party2?: string;
  party3?: string;
  previous1?: string;
  previous2?: string;
  previous3?: string;
  round: number = 8;
  level: FrontierLevel = FrontierLevel.Level50;
  type: PokemonType = "bug";
  style: number = BattleStyle.HighRiskHighReturn;

  constructor(private pokemonService: IPokemonService) {
    this.pokemon = [];
    this.algorithm = new BattleFactoryGen3Algorithm(pokemonService);
  }

  public nextBattle() {
    this.party1 = '';
    this.party2 = '';
    this.party3 = '';
    if (!!this.enemy1.specie) {
      this.previous1 = this.enemy1.specie;
      this.enemy1.specie = '';
    }
    if (!!this.enemy2.specie) {
      this.previous2 = this.enemy2.specie;
      this.enemy2.specie = '';
    }
    if (!!this.enemy3.specie) {
      this.previous3 = this.enemy3.specie;
      this.enemy3.specie = '';
    }
  }

  public generateExcel() {
    const enemySet = new PokemonSet();
    const partySet = new PokemonSet();
    this.pokemon = this.pokemonService.getPokemonFromGroup(this.level, this.round);
    console.log("length", this.pokemon.length)
    if (!!this.enemy1.specie) enemySet.pokemons.push(this.enemy1);
    if (!!this.enemy2.specie) enemySet.pokemons.push(this.enemy2);
    if (!!this.enemy3.specie) enemySet.pokemons.push(this.enemy3);
    if (!!this.party1) partySet.pokemons.push(Pokemon.FromSpecie(this.party1));
    if (!!this.party2) partySet.pokemons.push(Pokemon.FromSpecie(this.party2));
    if (!!this.party3) partySet.pokemons.push(Pokemon.FromSpecie(this.party3));
    if (!!this.previous1) partySet.pokemons.push(Pokemon.FromSpecie(this.previous1));
    if (!!this.previous2) partySet.pokemons.push(Pokemon.FromSpecie(this.previous2));
    if (!!this.previous3) partySet.pokemons.push(Pokemon.FromSpecie(this.previous3));
    this.totalPokemonSets =
      this.algorithm.getSets(
        partySet,
        enemySet,
        this.level as FrontierLevel,
        this.round!,
        this.type as any,
        this.style as BattleStyle);
    const enemySpecies = enemySet.pokemons.map(x => x.specie);
    const totalSets = this.totalPokemonSets.flatMap(x => x.pokemons);
    const species: Record<string, Pokemon[]> = this.groupBy(totalSets.filter(x => enemySpecies.includes(x.specie)), x => x.specie);
    if (!!this.enemy1.specie)
      this.enemy1Percentage = this.getPercentages(species[this.enemy1.specie])
    if (!!this.enemy2.specie)
      this.enemy2Percentage = this.getPercentages(species[this.enemy2.specie])
    if (!!this.enemy3.specie)
      this.enemy3Percentage = this.getPercentages(species[this.enemy3.specie])
    {
      const totalRemaininSets = totalSets.filter(x => !enemySpecies.includes(x.specie));
      const allGroupedRemainingSpecies = this.groupBy(totalRemaininSets, x => x.specie);
      const orderedByChance = Object.values(allGroupedRemainingSpecies).sort((a, b) => b.length - a.length)
        .map((x, _, array) => new PokemonPercentage((x.length / totalRemaininSets.length), x[0]));
      if (orderedByChance.length === 3 - enemySpecies.length) {
        let i = 0;
        if (!this.enemy2.specie) {
          this.enemy2.specie = orderedByChance[i++].pokemon.specie;
        }
        if (!this.enemy3.specie) {
          this.enemy3.specie = orderedByChance[i++].pokemon.specie;
          this.enemy3Percentage = this.getPercentages(totalRemaininSets.filter(x => x.specie === this.enemy3.specie))
        }
      }
      this.pokemonSets = orderedByChance.slice(0, 10).filter(x => x.percentage >= 0.04);
      this.str = `showing ${this.pokemonSets.length} of ${orderedByChance.length} possible sets`;
    }
  }

  private getPercentages(species: Pokemon[]) {
    return Object.values(this.groupBy(species, p => p.set))
      .map(p => new PokemonPercentage((p.length / species.length), p[0]))
  }

  onPokemonChanged(enemy1: Pokemon) {
  }

  groupBy<T, K extends keyof any>(arr: T[], key: (i: T) => K): Record<K, T[]> {
    return arr.reduce((groups, item) => {
      (groups[key(item)] ||= []).push(item);
      return groups;
    }, {} as Record<K, T[]>);
  }

  protected readonly FrontierLevel = FrontierLevel;
  protected readonly PokemonTypes = PokemonTypes;
  protected readonly BattleStyle = BattleStyle;
}
