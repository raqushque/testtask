import { Injectable } from '@angular/core';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import {Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {toLonLat, fromLonLat} from 'ol/proj';
import {IconGeneratorService} from "./icon-generator.service";

@Injectable({
  providedIn: 'root'
})
export class MapHandlerService {

  constructor(private iconService: IconGeneratorService) { }

  placeMarkers(count: number, map: Map) { // управляет генерацией и расстановкой маркеров
    let extent = map.getView().calculateExtent(map.getSize()); // координаты углов карты
    map.getLayers().getArray()
      .filter(layer => layer.get('name') === 'markers')
      .forEach(layer => map.removeLayer(layer)); // убираем старые маркеры
    let markerRNG: Feature[] = [];
    let markerStyle: Style[] = [];
    let imageURLs = []; // Удаляем старые иконки маркеров
    this.iconService.createIconsArray(count).then(res => { // ждем генерации count иконок
      imageURLs = res;
      for (let i = 0; i < count; i++) {
        let lonlat = fromLonLat(toLonLat([Math.random() * (extent[2] - extent[0]) + extent[0],
          Math.random() * (extent[3] - extent[1]) + extent[1]])); /* позволяет избегать непостановки маркеров при
                                                                     прокрутке карты за 2 экрана(вероятно, из-за
                                                                     слишком больших/маленьких координат)*/
        markerRNG.push(new Feature({
            type: 'rng' + i,
            geometry: new Point(lonlat)
          })
        );
        markerStyle['rng' + i] = (new Style({ // генерируем стили маркеров
          image: new Icon({
            src: imageURLs[i],
            scale: 0.3
          })
        }))
      }
      let markerLayer = new VectorLayer({ // создаем слой и добавляем маркеры на него
        source: new VectorSource({
          features: markerRNG
        }),
        name: 'markers',
        style: feature => {
          return markerStyle[feature.get('type')]
        },
        zIndex: 100
      });
      map.addLayer(markerLayer);// добавляем слой на карту
    }).catch(() => console.log('not yet preloaded'));
  }

}
