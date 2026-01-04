import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlacesService } from '../../services/places.service';
import { TranslationService } from '../../services/translation.service';
import { Place } from '../../models/place.model';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (place) {
      <div class="overlay" (click)="close()"></div>
      <div class="popup">
        <div class="popup-image">
          <img [src]="place.image" [alt]="placeName">
          <button class="close-btn" (click)="close()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="type-badge" [class.hotel]="place.type === 'hotel'" [class.restaurant]="place.type === 'restaurant'">
            {{ place.type === 'hotel' ? t('hotels') : t('restaurants') }}
          </div>
        </div>

        <div class="popup-content">
          <div class="header">
            <h2>{{ placeName }}</h2>
            <div class="rating">
              @for (star of [1,2,3,4,5]; track star) {
                <span class="star" [class.filled]="star <= place.rating">&#9733;</span>
              }
            </div>
          </div>

          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">{{ t('address') }}</div>
              <div class="info-value">{{ place.address }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">{{ t('postalCode') }}</div>
              <div class="info-value">{{ place.postalCode }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">{{ t('municipality') }}</div>
              <div class="info-value">{{ place.municipality }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">{{ t('province') }}</div>
              <div class="info-value">{{ place.province }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">{{ t('phone') }}</div>
              <div class="info-value">
                <a [href]="'tel:' + place.phone">{{ place.phone }}</a>
              </div>
            </div>
            @if (place.email) {
            <div class="info-row">
              <div class="info-label">{{ t('email') }}</div>
              <div class="info-value">
                <a [href]="'mailto:' + place.email">{{ place.email }}</a>
              </div>
            </div>
            }
            <div class="info-row">
              <div class="info-label">{{ t('website') }}</div>
              <div class="info-value">
                <a [href]="'https://' + place.website" target="_blank">{{ place.website }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translate(-50%, -45%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    .popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow: hidden;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    }

    .popup-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .popup-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .close-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(0, 0, 0, 0.6);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      transition: background 0.3s;
    }

    .close-btn:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    .type-badge {
      position: absolute;
      bottom: 15px;
      left: 15px;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }

    .type-badge.hotel {
      background: #8B4513;
    }

    .type-badge.restaurant {
      background: #DC143C;
    }

    .popup-content {
      padding: 24px;
      max-height: calc(80vh - 200px);
      overflow-y: auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 20px;
      gap: 15px;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #333;
      flex: 1;
    }

    .rating {
      display: flex;
      gap: 4px;
    }

    .star {
      color: #ccc;
      font-size: 20px;
    }

    .star.filled {
      color: #FFD700;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      font-size: 11px;
      color: #999;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 15px;
      color: #333;
      font-weight: 500;
    }

    .info-value a {
      color: #667eea;
      text-decoration: none;
      transition: text-decoration 0.2s;
    }

    .info-value a:hover {
      text-decoration: underline;
    }
  `]
})
export class PopupComponent {
  constructor(
    private placesService: PlacesService,
    private translationService: TranslationService
  ) {}

  get place(): Place | null {
    return this.placesService.selectedPlace();
  }

  get placeName(): string {
    const place = this.place;
    if (!place) return '';
    return place.name[this.translationService.currentLanguage()];
  }

  close(): void {
    this.placesService.selectPlace(null);
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }
}