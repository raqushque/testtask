import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import Map from 'ol/Map';
import olms from 'ol-mapbox-style';
import {MapHandlerService} from "../../services/map-handler.service";
import {toLonLat, fromLonLat} from 'ol/proj';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  private map: Map;
  private markerCount = 15;
  constructor(private mapService: MapHandlerService) { }

  getCoords(event) { // для дебага и экспериментов
    let coord = this.map.getEventCoordinate(event);
    let Tlonlat, FlonLat;
    console.log('base coord: ');
    console.log(coord);
    Tlonlat = toLonLat(coord);
    console.log('toLonLat: ');
    console.log(Tlonlat);
    FlonLat = fromLonLat(Tlonlat);
    console.log('fromLonLat: ');
    console.log(FlonLat);
  }

  placeMarkers(count) {
    this.mapService.placeMarkers(count, this.map)
  }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    let style = 'https://api.maptiler.com/maps/basic/style.json?key=BuNi4FPIgsaSVnVlaLoQ';
    this.map = this.mapService.initializeMap('map', [4184316.5344758555, 7503867.160605794], 5);
    olms(this.map, style);
  }

}
