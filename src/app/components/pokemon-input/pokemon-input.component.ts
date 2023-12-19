import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatInputModule} from "@angular/material/input";
import {CommonModule, NgForOf} from "@angular/common";
import {debounceTime, filter, map, merge, Observable, startWith, Subject, tap} from "rxjs";
import {Pokemon} from "../../Models/Pokemon";
import {IPokemonService} from "../../services/IPokemonService";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {PokemonNameSelectorComponent} from "../pokemon-name-selector/pokemon-name-selector.component";
import {PokemonMoveSelectorComponent} from "../pokemon-move-selector/pokemon-move-selector.component";
import {PokemonItemSelectorComponent} from "../pokemon-item-selector/pokemon-item-selector.component";

@Component({
  selector: 'app-pokemon-input',
  standalone: true,
  imports: [

    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    NgForOf,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    PokemonNameSelectorComponent,
    PokemonMoveSelectorComponent,
    PokemonItemSelectorComponent
  ],
  templateUrl: './pokemon-input.component.html',
  styleUrl: './pokemon-input.component.scss'
})
export class PokemonInputComponent {
  private filterSubject: Subject<void>;

  constructor(private pokemonService: IPokemonService) {

    this.filteredOptions = merge(...this.allMoveControls.map(x => x.valueChanges))
      .pipe(
        map(x => this._filter(x!))
      )
    this.name$ = this.nameControl.valueChanges
      .pipe(
        map(x => this.nameFilter(x!))
      );
    this.filterSubject = new Subject<void>();
    this.filterSubject.pipe(debounceTime(300)).subscribe(_ => {
      console.log("next pokemon")
      this.possiblePokemon = this.pokemonService.getAllPokemonFromSpecie(this.nameControl.value!);
      this.pokemon.specie = this.nameControl.value || '';
      this.allMoveControls.forEach(x => x.setValue('', {emitEvent: true}));
      this.pokemon.moves = [];
      this.pokemon.ability = "";
      this.pokemon.item = "";
    });

  }

  @Input() title?: string = "Opponent";
  @Input() pokemon!: Pokemon;
  @Input() possiblePokemon!: Pokemon[];
  @Input() onlyName = false;
  @Output() changed = new EventEmitter<void>();
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  nameControl = new FormControl('');
  entryControl = new FormControl('');
  move1Control = new FormControl('');
  move2Control = new FormControl('');
  move3Control = new FormControl('');
  move4Control = new FormControl('');
  allMoveControls = [this.move1Control, this.move2Control, this.move3Control, this.move4Control];
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions?: Observable<string[]>;
  name$: Observable<string[]>;
  names: string[] = [];

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    this.pokemon.moves = this.allMoveControls
      .filter(x => !!x.value)
      .map(x => x.value!)

    function removeDuplicates(arr: string[]): string[] {
      return arr.reduce(function (acc: string[], curr) {
        if (!acc.includes(curr))
          acc.push(curr);
        return acc;
      }, []);
    }

    return removeDuplicates(this.possiblePokemon.flatMap(x => x.moves))
      ?.filter(x => !this.pokemon.moves.includes(x))
      .filter(x => x.toLowerCase().includes(filterValue));
  }

  nameFilter(value: string) {
    const filterValue = value.toLowerCase();
    this.filterSubject.next();
    return this.pokemonService.getAllPokemonNames().filter(o => o.toLowerCase().includes(filterValue));
  }

  specieChanged(specie: string) {
    this.pokemon.specie = specie || '';
    this.pokemon.moves = ['', '', '', ''];
    this.pokemon.ability = "";
    this.pokemon.item = "";
  }

  itemChanged(item: string) {
    this.pokemon.item = item;
  }

  moveChanged(move: string, i: number) {
    this.pokemon.moves[i] = move;
  }
}
