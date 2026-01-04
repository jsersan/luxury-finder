import { Component, computed, signal, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MapComponent } from './components/map/map.component'
import { PopupComponent } from './components/popup/popup.component'
import { PlacesService } from './services/places.service'
import { TranslationService } from './services/translation.service'
import { Language, Place } from './models/place.model'
import { forwardRef } from '@angular/core';
import { TranslatePipe } from './pipe/translate.pipe'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, 
            MapComponent, 
            PopupComponent, 
            forwardRef(() => PopupComponent),  // ← Temporal
            TranslatePipe],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="header-left">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h1>{{ 'title' }}</h1>
          </div>
          <div class="language-selector">
            @for (lang of languages; track trackLang($index, lang)) {
            <button
              class="lang-btn"
              [class.active]="currentLang() === lang"
              (click)="setLanguage(lang)"
            >
              {{ lang.toUpperCase() }}
            </button>
            }
          </div>
        </div>
      </header>

      <!-- Loading State -->
      @if (isLoading()) {
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Cargando establecimientos...</p>
      </div>
      }

      <!-- Controls -->
      @if (!isLoading()) {
      <div class="controls">
        <div class="controls-content">
          <!-- Search -->
          <div class="search-container">
            <svg
              class="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="{{ 'search' | t }}"
              [value]="searchTerm()"
              (input)="onSearchChange($event.target.value)"
            />
          </div>

          <!-- Stats -->
          <div class="stats">
            <span class="stat-item">Total: {{ filteredPlaces().length }} establecimientos</span>
            <span class="stat-item">Hoteles: {{ getHotelCount() }}</span>
            <span class="stat-item">Restaurantes: {{ getRestaurantCount() }}</span>
          </div>

          <!-- Type Filters -->
          <div class="filter-buttons">
            <button
              class="filter-btn"
              [class.active-all]="selectedType() === 'all'"
              (click)="setType('all')"
            >
              {{ 'all' }}
            </button>
            <button
              class="filter-btn"
              [class.active-hotel]="selectedType() === 'hotel'"
              (click)="setType('hotel')"
            >
              {{ 'hotels' }}
            </button>
            <button
              class="filter-btn"
              [class.active-restaurant]="selectedType() === 'restaurant'"
              (click)="setType('restaurant')"
            >
              {{ 'restaurants' }}
            </button>
          </div>
        </div>
      </div>
      }

      <!-- Map -->
      <div class="map-container">
        <app-map [filteredPlaces]="filteredPlaces()"></app-map>
      </div>

      <!-- Popup -->
      <app-popup></app-popup>
    </div>
  `,
  styles: [
    `
      /* Tus estilos CSS aquí sin cambios - copiar del original */
      .app-container {
        /* ... */
      }
      /* etc. */
    `
  ]
})
export class AppComponent {
  private placesService = inject(PlacesService)
  private translationService = inject(TranslationService)

  // Signals
  languages: Language[] = ['es', 'eu', 'en']
  searchTerm = signal('')
  selectedType = signal<'all' | 'hotel' | 'restaurant'>('all')

  // Computed
  currentLang = computed(() => this.translationService.currentLanguage())
  isLoading = computed(() => this.placesService.isLoading)
  filteredPlaces = computed(() => {
    const places = this.placesService.places()
    const term = this.searchTerm().toLowerCase()
    const type = this.selectedType()
    const lang = this.currentLang()
    return places.filter((place: Place) => {
      const matchesType = type === 'all' || place.type === type
      const matchesSearch =
        place.name[lang]?.toLowerCase().includes(term) ||
        place.municipality.toLowerCase().includes(term) ||
        place.province.toLowerCase().includes(term)
      return matchesType && matchesSearch
    })
  })

  trackLang = (index: number, lang: Language): Language => lang

  setLanguage (lang: Language): void {
    this.translationService.setLanguage(lang)
  }

  onSearchChange (value: string): void {
    this.searchTerm.set(value)
  }

  getHotelCount (): number {
    return this.filteredPlaces().filter((p: Place) => p.type === 'hotel').length
  }

  getRestaurantCount (): number {
    return this.filteredPlaces().filter((p: Place) => p.type === 'restaurant').length
  }

  setType (type: 'all' | 'hotel' | 'restaurant'): void {
    this.selectedType.set(type)
  }
}
