import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MapComponent } from './components/map/map.component'
import { PopupComponent } from './components/popup/popup.component'
import { PlacesService } from './services/places.service'
import { TranslationService } from './services/translation.service'
import { Language, Place } from './models/place.model'
import { TranslatePipe } from './pipe/translate.pipe'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent, PopupComponent, TranslatePipe],
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
            <h1>{{ 'title' | t }}</h1>
          </div>
          <div class="language-selector">
            @for (lang of languages; track trackLang($index, lang)) {
            <button
              class="lang-btn"
              [class.active]="currentLang === lang"
              (click)="setLanguage(lang)"
            >
              {{ lang.toUpperCase() }}
            </button>
            }
          </div>
        </div>
      </header>

      <!-- Loading State -->
      @if (isLoading) {
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Cargando establecimientos...</p>
      </div>
      }

      <!-- Controls -->
      @if (!isLoading) {
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
              (input)="onSearchChange($event)"
            />
          </div>

          <!-- Stats -->
          <div class="stats">
            <span class="stat-item">Total: {{ filteredPlaces.length }} establecimientos</span>
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
              {{ 'all' | t }}
            </button>
            <button
              class="filter-btn"
              [class.active-hotel]="selectedType() === 'hotel'"
              (click)="setType('hotel')"
            >
              {{ 'hotels' | t }}
            </button>
            <button
              class="filter-btn"
              [class.active-restaurant]="selectedType() === 'restaurant'"
              (click)="setType('restaurant')"
            >
              {{ 'restaurants' | t }}
            </button>
          </div>
        </div>
      </div>
      }

      <!-- Map -->
      <div class="map-container">
        <app-map [filteredPlaces]="filteredPlaces"></app-map>
      </div>

      <!-- Popup -->
      <app-popup></app-popup>
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: #f5f5f5;
      }

      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .header-content {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
      }

      .language-selector {
        display: flex;
        gap: 10px;
      }

      .lang-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
      }

      .lang-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .lang-btn.active {
        background: white;
        color: #667eea;
        border-color: white;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        gap: 20px;
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .controls {
        background: white;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .controls-content {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .search-container {
        position: relative;
        width: 100%;
      }

      .search-icon {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
      }

      .search-input {
        width: 100%;
        padding: 12px 15px 12px 45px;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        font-size: 16px;
        transition: border-color 0.3s;
      }

      .search-input:focus {
        outline: none;
        border-color: #667eea;
      }

      .stats {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
      }

      .stat-item {
        color: #666;
        font-size: 14px;
        font-weight: 600;
      }

      .filter-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .filter-btn {
        padding: 10px 20px;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
        color: #333;
      }

      .filter-btn:hover {
        border-color: #667eea;
        color: #667eea;
      }

      .filter-btn.active-all {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: #667eea;
      }

      .filter-btn.active-hotel {
        background: #8B4513;
        color: white;
        border-color: #8B4513;
      }

      .filter-btn.active-restaurant {
        background: #DC143C;
        color: white;
        border-color: #DC143C;
      }

      .map-container {
        flex: 1;
        position: relative;
        overflow: hidden;
      }
    `
  ]
})
export class AppComponent {
  languages: Language[] = ['es', 'eu', 'en'];
  searchTerm = signal('');
  selectedType = signal<'all' | 'hotel' | 'restaurant'>('all');

  constructor(
    private placesService: PlacesService,
    private translationService: TranslationService
  ) {}

  // Usar getters en lugar de computed()
  get currentLang(): Language {
    return this.translationService.currentLanguage();
  }

  get isLoading(): boolean {
    return this.placesService.isLoading();
  }

  get filteredPlaces(): Place[] {
    const places = this.placesService.places();
    const term = this.searchTerm().toLowerCase();
    const type = this.selectedType();
    const lang = this.currentLang;
    
    return places.filter((place: Place) => {
      const matchesType = type === 'all' || place.type === type;
      const matchesSearch =
        place.name[lang]?.toLowerCase().includes(term) ||
        place.municipality.toLowerCase().includes(term) ||
        place.province.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  }

  trackLang = (index: number, lang: Language): Language => lang;

  setLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  getHotelCount(): number {
    return this.filteredPlaces.filter((p: Place) => p.type === 'hotel').length;
  }

  getRestaurantCount(): number {
    return this.filteredPlaces.filter((p: Place) => p.type === 'restaurant').length;
  }

  setType(type: 'all' | 'hotel' | 'restaurant'): void {
    this.selectedType.set(type);
  }
}