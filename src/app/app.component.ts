import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {Pokemon, PokemonSet} from "./Models/Pokemon";
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, PokemonInputComponent, PokemonNameSelectorComponent, MatCardModule, MatInputModule, MatSelectModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pokemonBattleFactoryApp';
  public pokemon: Pokemon[]
  public totalPokemonSets?: PokemonSet[]
  public pokemonSets?: PokemonSet[]
  public algorithm: Algorithm;
  public str?: string;
  playerEntry1: number = 840;
  playerEntry2: number = 440;
  playerEntry3: number = 841;
  enemy1: Pokemon = new Pokemon("", 1, ['','','',''], [], "", "", "");
  enemy2: Pokemon = new Pokemon("", 1, ['','','',''], [], "", "", "");
  enemy3: Pokemon = new Pokemon("", 1, ['','','',''], [], "", "", "");
  enemyEntry1?: number = 465;
  enemyEntry2?: number = 600;
  enemyEntry3?: number;

  round: number = 1;
  level: FrontierLevel = FrontierLevel.Level50;
  type: PokemonType = "none";
  style: number = BattleStyle.Flexible;

  constructor(private pokemonService: IPokemonService) {
    this.pokemon = [];
    this.algorithm = new BattleFactoryGen3Algorithm(pokemonService);
  }

  public generateExcel() {
    const enemySet = new PokemonSet();
    this.pokemon = this.pokemonService.getPokemonFromGroup(this.level, this.round);
    console.log("length", this.pokemon.length)
    if (!!this.enemy1.specie) enemySet.pokemons.push(this.enemy1);
    if (!!this.enemy2.specie) enemySet.pokemons.push(this.enemy2);
    if (!!this.enemy3.specie) enemySet.pokemons.push(this.enemy3);
    this.totalPokemonSets =
      this.algorithm.getSets(
        new PokemonSet([
          this.pokemonService.getPokemonFromEntry(this.playerEntry1),
          this.pokemonService.getPokemonFromEntry(this.playerEntry2),
          this.pokemonService.getPokemonFromEntry(this.playerEntry3),
        ]),
        enemySet,
        this.level as FrontierLevel,
        this.round!,
        this.type as any,
        this.style as BattleStyle);

    this.pokemonSets = this.totalPokemonSets.slice(0, 10);
    this.str = `showing ${this.pokemonSets.length} of ${this.totalPokemonSets.length} possible sets`;
  }

  onPokemonChanged(enemy1: Pokemon) {
  }

  protected readonly FrontierLevel = FrontierLevel;
  protected readonly PokemonTypes = PokemonTypes;
  protected readonly BattleStyle = BattleStyle;
}
