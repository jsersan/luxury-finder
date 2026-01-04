import { Component, OnInit, OnDestroy, input, effect, Injector, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import { Place } from '../../models/place.model';
import { PlacesService } from '../../services/places.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="map" style="width: 100%; height: 100%;"></div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  filteredPlaces = input.required<Place[]>();

  private map!: Map;
  private vectorSource!: VectorSource;
  private vectorLayer!: VectorLayer<VectorSource>;
  private injector = inject(Injector);

  constructor(private placesService: PlacesService) {}

  ngOnInit(): void {
    this.initMap();
    
    // Create effect in ngOnInit with explicit injector
    effect(() => {
      const places = this.filteredPlaces();
      if (this.vectorSource) {
        this.updateMarkers(places);
      }
    }, { injector: this.injector });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.setTarget(undefined);
    }
  }

  private initMap(): void {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.vectorLayer
      ],
      view: new View({
        center: fromLonLat([-3.7038, 40.4168]),
        zoom: 6
      })
    });

    this.map.on('click', (evt) => {
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const place = feature.get('place') as Place;
        this.placesService.selectPlace(place);
      }
    });

    this.updateMarkers(this.filteredPlaces());
  }

  private updateMarkers(places: Place[]): void {
    if (!this.vectorSource) return;
    
    this.vectorSource.clear();

    places.forEach(place => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(place.coordinates)),
        place: place
      });

      const color = place.type === 'hotel' ? '#8B4513' : '#DC143C';
      const label = place.type === 'hotel' ? 'H' : 'R';

      feature.setStyle(new Style({
        image: new Icon({
          src: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0 C9 0 0 9 0 20 C0 28 20 50 20 50 C20 50 40 28 40 20 C40 9 31 0 20 0 Z" 
                    fill="${color}" stroke="white" stroke-width="2"/>
              <circle cx="20" cy="20" r="12" fill="white"/>
              <text x="20" y="26" text-anchor="middle" font-size="16" font-weight="bold" fill="${color}">${label}</text>
            </svg>
          `),
          anchor: [0.5, 1],
          scale: 1
        })
      }));

      this.vectorSource.addFeature(feature);
    });
  }
}