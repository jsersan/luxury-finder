import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MapComponent } from './components/map/map.component';
import { PopupComponent } from './components/popup/popup.component';
import { PlacesService } from './services/places.service';
import { TranslationService } from './services/translation.service';
import { Language, Place } from './models/place.model';
import { AnyType } from '../../node_modules/ol/expr/expression';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MapComponent, PopupComponent],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="header-left">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <h1>{{ t('title') }}</h1>
          </div>

          <div class="language-selector">
            @for (lang of languages; track lang) {
              <button 
                class="lang-btn"
                [class.active]="currentLang() === lang"
                (click)="setLanguage(lang)">
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
              <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                type="text" 
                class="search-input"
                [placeholder]="t('search')"
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearchChange()">
            </div>

            <!-- Stats -->
            <div class="stats">
              <span class="stat-item">
                Total: {{ filteredPlaces().length }} establecimientos
              </span>
              <span class="stat-item">
                Hoteles: {{ getHotelCount() }}
              </span>
              <span class="stat-item">
                Restaurantes: {{ getRestaurantCount() }}
              </span>
            </div>

            <!-- Type Filters -->
            <div class="filter-buttons">
              <button 
                class="filter-btn"
                [class.active-all]="selectedType() === 'all'"
                (click)="setType('all')">
                {{ t('all') }}
              </button>
              <button 
                class="filter-btn"
                [class.active-hotel]="selectedType() === 'hotel'"
                (click)="setType('hotel')">
                {{ t('hotels') }}
              </button>
              <button 
                class="filter-btn"
                [class.active-restaurant]="selectedType() === 'restaurant'"
                (click)="setType('restaurant')">
                {{ t('restaurants') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Map -->
        <div class="map-container">
          <app-map [filteredPlaces]="filteredPlaces()"></app-map>
        </div>

        <!-- Popup -->
        <app-popup></app-popup>
      }
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
    }

    .loading-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
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
      padding: 8px 16px;
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      color: white;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s;
    }

    .lang-btn:hover,
    .lang-btn.active {
      background: rgba(255, 255, 255, 0.3);
    }

    .controls {
      background: white;
      padding: 20px 30px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .controls-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-container {
      flex: 1;
      min-width: 250px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }

    .search-input {
      width: 100%;
      padding: 12px 12px 12px 44px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 15px;
      outline: none;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      border-color: #667eea;
    }

    .stats {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .stat-item {
      padding: 8px 12px;
      background: #f0f0f0;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #555;
    }

    .filter-buttons {
      display: flex;
      gap: 10px;
    }

    .filter-btn {
      padding: 12px 24px;
      background: #f0f0f0;
      color: #333;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s;
    }

    .filter-btn.active-all {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .filter-btn.active-hotel {
      background: #8B4513;
      color: white;
    }

    .filter-btn.active-restaurant {
      background: #DC143C;
      color: white;
    }

    .map-container {
      flex: 1;
      position: relative;
    }
  `]
})
export class AppComponent {
  languages: Language[] = ['es', 'eu', 'en'];
  currentLang = this.translationService.currentLanguage;
  isLoading = this.placesService.isLoading;
  
  searchTerm = signal('');
  selectedType = signal<'all' | 'hotel' | 'restaurant'>('all');

  filteredPlaces = computed(() => {
    const places = this.placesService.places();
    const term = this.searchTerm().toLowerCase();
    const type = this.selectedType();
    const lang = this.currentLang();

    return places.filter((place: { type: any; name: { [x: string]: string; }; municipality: string; province: string; }) => {
      const matchesType = type === 'all' || place.type === type;
      const matchesSearch = place.name[lang].toLowerCase().includes(term) ||
                           place.municipality.toLowerCase().includes(term) ||
                           place.province.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  });

  constructor(
    private placesService: PlacesService,
    private translationService: TranslationService
  ) {}

  setLanguage(lang: Language) {
    this.translationService.setLanguage(lang);
  }

  setType(type: 'all' | 'hotel' | 'restaurant') {
    this.selectedType.set(type);
  }

  onSearchChange() {
    // El computed se actualiza automáticamente
  }

  getHotelCount(): number {
    return this.filteredPlaces().filter(p => p.type === 'hotel').length;
  }

  getRestaurantCount(): number {
    return this.filteredPlaces().filter(p => p.type === 'restaurant').length;
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }
}