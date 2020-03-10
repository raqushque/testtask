import {Component, OnInit} from '@angular/core';

import Map from 'ol/Map';
import {MapHandlerService} from "../../services/map-handler.service";
import {toLonLat, fromLonLat} from 'ol/proj';
import {OLMapOptions} from "../../classes/olmap-options";
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  private map: Map;
  markerCount = 15;
  mapOptions = new OLMapOptions([4184316.5344758555, 7503867.160605794], 5);
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

  saveMap(event) {
    this.map = event;
  }

  ngOnInit(): void {
  }

}
