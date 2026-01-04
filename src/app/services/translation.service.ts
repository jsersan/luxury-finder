import { Injectable, signal } from '@angular/core';
import { Language } from '../models/place.model';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLanguage = signal<Language>('es');

  private translations: Translations = {
    es: {
      title: 'Buscador de Establecimientos de Lujo',
      hotels: 'Hoteles',
      restaurants: 'Restaurantes',
      all: 'Todos',
      search: 'Buscar...',
      address: 'Dirección',
      postalCode: 'Código Postal',
      municipality: 'Municipio',
      province: 'Provincia',
      phone: 'Teléfono',
      email: 'Email',
      website: 'Sitio Web',
      rating: 'Valoración',
      close: 'Cerrar'
    },
    eu: {
      title: 'Luxuzko Establezimenduak Bilatzailea',
      hotels: 'Hotelak',
      restaurants: 'Jatetxeak',
      all: 'Guztiak',
      search: 'Bilatu...',
      address: 'Helbidea',
      postalCode: 'Posta Kodea',
      municipality: 'Udalerria',
      province: 'Probintzia',
      phone: 'Telefonoa',
      email: 'Emaila',
      website: 'Webgunea',
      rating: 'Balorazioa',
      close: 'Itxi'
    },
    en: {
      title: 'Luxury Establishments Finder',
      hotels: 'Hotels',
      restaurants: 'Restaurants',
      all: 'All',
      search: 'Search...',
      address: 'Address',
      postalCode: 'Postal Code',
      municipality: 'Municipality',
      province: 'Province',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      rating: 'Rating',
      close: 'Close'
    }
  };

  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);
  }

  translate(key: string): string {
    return this.translations[this.currentLanguage()][key] || key;
  }
}