import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Place, HotelesData, RestaurantesData, HotelJson, RestaurantJson } from '../models/place.model';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private http = inject(HttpClient);
  private placesData: Place[] = [];
  
  places = signal<Place[]>([]);
  selectedPlace = signal<Place | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Cargar ambos archivos JSON en paralelo
    forkJoin({
      hoteles: this.http.get<HotelesData>('assets/data/hoteles_espana.json'),
      restaurantes: this.http.get<RestaurantesData>('assets/data/michelin_espana.json')
    }).pipe(
      map(({ hoteles, restaurantes }) => {
        const hotelesTransformados = this.transformHoteles(hoteles.hoteles);
        const restaurantesTransformados = this.transformRestaurantes(restaurantes.restaurantes);
        return [...hotelesTransformados, ...restaurantesTransformados];
      })
    ).subscribe({
      next: (allPlaces) => {
        this.placesData = allPlaces;
        this.places.set(allPlaces);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando datos:', error);
        this.isLoading.set(false);
      }
    });
  }

  private transformHoteles(hoteles: HotelJson[]): Place[] {
    return hoteles.map((hotel, index) => ({
      id: index + 1,
      type: 'hotel' as const,
      name: {
        es: hotel.nombre,
        eu: hotel.nombre, // Podrías traducir si tienes las traducciones
        en: hotel.nombre
      },
      address: hotel.direccion,
      postalCode: hotel.cp,
      municipality: hotel.ciudad,
      province: hotel.provincia,
      phone: hotel.telefono,
      email: '', // No disponible en el JSON
      website: hotel.web,
      rating: hotel.estrellas,
      coordinates: [hotel.longitud, hotel.latitud],
      image: this.getHotelImage(index)
    }));
  }

  private transformRestaurantes(restaurantes: RestaurantJson[]): Place[] {
    const hotelCount = 380; // Número de hoteles para el offset del ID
    return restaurantes.map((restaurante, index) => ({
      id: hotelCount + index + 1,
      type: 'restaurant' as const,
      name: {
        es: restaurante.nombre,
        eu: restaurante.nombre,
        en: restaurante.nombre
      },
      address: restaurante.direccion,
      postalCode: restaurante.cp,
      municipality: restaurante.ciudad,
      province: restaurante.provincia,
      phone: restaurante.telefono,
      email: '',
      website: restaurante.web,
      rating: restaurante.estrellas,
      coordinates: [restaurante.longitud, restaurante.latitud],
      image: this.getRestaurantImage(index)
    }));
  }

  private getHotelImage(index: number): string {
    // Ciclar entre las imágenes disponibles
    const imageNumber = (index % 6) + 1;
    return `https://images.unsplash.com/photo-${this.getUnsplashHotelId(imageNumber)}?w=400&h=250&fit=crop`;
  }

  private getRestaurantImage(index: number): string {
    const imageNumber = (index % 6) + 1;
    return `https://images.unsplash.com/photo-${this.getUnsplashRestaurantId(imageNumber)}?w=400&h=250&fit=crop`;
  }

  private getUnsplashHotelId(num: number): string {
    const ids = [
      '1566073771259-6a8506099945', // Hotel 1
      '1542314831-068cd1dbfeeb',     // Hotel 2
      '1571896349842-33c89424de2d',   // Hotel 3
      '1445019980597-93fa8acb246c',   // Hotel 4
      '1551882547-ff40c63fe5fa',      // Hotel 5
      '1584132967334-10e028bd1f0e'    // Hotel 6
    ];
    return ids[num - 1];
  }

  private getUnsplashRestaurantId(num: number): string {
    const ids = [
      '1517248135467-4c7edcad34c4', // Restaurant 1
      '1414235077428-338989a2e8c0', // Restaurant 2
      '1559339352-11d035aa65de',    // Restaurant 3
      '1551218808-94e220e084d2',    // Restaurant 4
      '1550966871-3ed3cdb5ed0c',    // Restaurant 5
      '1559925393-8be0ec4767c8'     // Restaurant 6
    ];
    return ids[num - 1];
  }

  getAllPlaces(): Place[] {
    return this.placesData;
  }

  selectPlace(place: Place | null) {
    this.selectedPlace.set(place);
  }
}