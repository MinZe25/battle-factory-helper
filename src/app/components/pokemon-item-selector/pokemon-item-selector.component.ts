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
  selector: 'app-pokemon-item-selector',
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
  templateUrl: './pokemon-item-selector.component.html',
  styleUrl: './pokemon-item-selector.component.scss'
})
export class PokemonItemSelectorComponent {
  items: string[];
  allItems: string[];

  @Input() set pokemon(specie: string) {
    this.nameControl.setValue('');
    this.allItems = this.getAllItems(specie);
    if (this.allItems.length === 1) {
      this.nameControl.setValue(this.allItems[0])
    }
  }

  @Output() itemChanged = new EventEmitter<string>;
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  nameControl = new FormControl('');
  $name: Observable<string | null>;

  constructor(private pokemonService: PokemonService) {
    this.allItems = [];
    this.items = []
    this.$name = this.nameControl.valueChanges.pipe(
      tap(x => this.itemChanged.next(x ?? ''))
    )
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.items = this.allItems.filter(o => o.toLowerCase().includes(filterValue));
  }

  private getAllItems(specie: string): string[] {
    return this.removeDuplicates(this.pokemonService.getAllPokemonFromSpecie(specie).flatMap(x => x.item));
  }

  private removeDuplicates(arr: string[]): string[] {
    return arr.reduce(function (acc: string[], curr) {
      if (!acc.includes(curr))
        acc.push(curr);
      return acc;
    }, []);
  }

}
