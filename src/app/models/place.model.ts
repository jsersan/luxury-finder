export interface Place {
    id: number;
    type: 'hotel' | 'restaurant';
    name: {
      es: string;
      eu: string;
      en: string;
    };
    address: string;
    postalCode: string;
    municipality: string;
    province: string;
    phone: string;
    email?: string;
    website: string;
    rating: number;
    coordinates: [number, number];
    image: string;
  }
  
  export type Language = 'es' | 'eu' | 'en';
  
  // Interfaces para los JSON originales
  export interface HotelJson {
    nombre: string;
    estrellas: number;
    ciudad: string;
    provincia: string;
    comunidad_autonoma: string;
    latitud: number;
    longitud: number;
    web: string;
    direccion: string;
    cp: string;
    telefono: string;
  }
  
  export interface RestaurantJson {
    nombre: string;
    ciudad: string;
    estrellas: number;
    direccion: string;
    cp: string;
    telefono: string;
    provincia: string;
    comunidad_autonoma: string;
    latitud: number;
    longitud: number;
    web: string;
  }
  
  export interface HotelesData {
    guia: string;
    registros: number;
    hoteles: HotelJson[];
  }
  
  export interface RestaurantesData {
    guia: string;
    total_restaurantes_con_estrella: number;
    restaurantes: RestaurantJson[];
  }