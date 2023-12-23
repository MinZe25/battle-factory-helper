import {Component, Input} from '@angular/core';
import {PokemonPercentage} from "../../Models/Pokemon";
import {MatCardModule} from "@angular/material/card";
import {PercentPipe} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";

@Component({
  selector: 'app-pokemon-percentage-summary',
  standalone: true,
  imports: [
    MatCardModule,
    PercentPipe,
    MatButtonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './pokemon-percentage-summary.component.html',
  styleUrl: './pokemon-percentage-summary.component.scss'
})
export class PokemonPercentageSummaryComponent {
  @Input() pokemon!: PokemonPercentage;
}
