import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {PokemonService} from "./services/pokemon.service";
import {IPokemonService} from "./services/IPokemonService";
import {provideAnimations} from '@angular/platform-browser/animations';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {provide: IPokemonService, useClass: PokemonService},
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}},
    provideAnimations()
  ]
};
