import {Directive, ElementRef, Output, EventEmitter, AfterViewInit, Input} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import olms from 'ol-mapbox-style';
import {OLMapOptions} from "../classes/olmap-options";

@Directive({
  selector: '[appOLMap]'
})
export class OLMapDirective implements AfterViewInit {
  @Output() mapEmit = new EventEmitter<Map>();
  @Input('appOLMap') mapOptions: OLMapOptions;
  private map: Map;
  private style = 'https://api.maptiler.com/maps/basic/style.json?key=BuNi4FPIgsaSVnVlaLoQ';
  constructor(private element: ElementRef) {
  }
  /* создает и передает необходимые для дальнейшего использования карты параметры*/
  ngAfterViewInit() {
    this.map = new Map({
      target: this.element.nativeElement,
      view: new View({
        constrainResolution: true,
        center: this.mapOptions.getCenter,
        zoom: this.mapOptions.getZoom
      })
    });
    olms(this.map, this.style);
    this.mapEmit.emit(this.map);
  }
}
