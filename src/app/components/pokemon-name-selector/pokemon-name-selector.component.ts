import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Pokemon} from "../../Models/Pokemon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {PokemonService} from "../../services/pokemon.service";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {filter, Observable, tap} from "rxjs";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-pokemon-name-selector',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './pokemon-name-selector.component.html',
  styleUrl: './pokemon-name-selector.component.scss'
})
export class PokemonNameSelectorComponent {
  pokemons?: string[];
  @Output() specieChanged = new EventEmitter<string>;
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  nameControl = new FormControl('');
  $name: Observable<string | null>;

  constructor(private pokemonService: PokemonService) {
    this.pokemons = pokemonService.getAllPokemonNames();
    this.$name = this.nameControl.valueChanges.pipe(
      tap(x => this.specieChanged.next(x ?? ''))
    )
  }
  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.pokemons = this.pokemonService.getAllPokemonNames().filter(o => o.toLowerCase().includes(filterValue));
  }
}
