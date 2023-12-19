import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AsyncPipe, NgIf} from "@angular/common";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {Observable, tap} from "rxjs";
import {PokemonService} from "../../services/pokemon.service";

@Component({
  selector: 'app-pokemon-move-selector',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './pokemon-move-selector.component.html',
  styleUrl: './pokemon-move-selector.component.scss'
})
export class PokemonMoveSelectorComponent {
  moves: string[];
  allMoves: string[];
  @Input() label: string = "Move";

  @Input() set pokemon(specie: string) {
    this.nameControl.setValue('');
    this.allMoves = this.getAllMoves(specie);
  }

  @Output() moveChanged = new EventEmitter<string>;
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  nameControl = new FormControl('');
  $name: Observable<string | null>;

  constructor(private pokemonService: PokemonService) {
    this.allMoves = [];
    this.moves = []
    this.$name = this.nameControl.valueChanges.pipe(
      tap(x => this.moveChanged.next(x ?? ''))
    )
  }
  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.moves = this.allMoves.filter(o => o.toLowerCase().includes(filterValue));
  }

  private getAllMoves(specie: string): string[] {
    return this.removeDuplicates(this.pokemonService.getAllPokemonFromSpecie(specie).flatMap(x => x.moves));
  }

  private removeDuplicates(arr: string[]): string[] {
    return arr.reduce(function (acc: string[], curr) {
      if (!acc.includes(curr))
        acc.push(curr);
      return acc;
    }, []);
  }
}
