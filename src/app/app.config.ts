import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // ← CRÍTICO
import { importProvidersFrom } from '@angular/core'; // Si necesitas módulos
import { routes } from './app.routes'; // o tu routes

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // HTTP para PlacesService
    // Agrega services aquí si NO tienen providedIn: 'root'
    // TranslationService,
  ]
};
