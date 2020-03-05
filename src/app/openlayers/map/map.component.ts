import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import olms from 'ol-mapbox-style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import {Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', {static: false}) canvas: ElementRef;
  map: Map;
  imageURLs: string[] = [];
  public markerCount;
  constructor() { }
  placeMarkers(count) {
      let extent = this.map.getView().calculateExtent(this.map.getSize()); // координаты углов карты
      this.map.getLayers().getArray()
        .filter(layer => layer.get('name') === 'markers')
        .forEach(layer => this.map.removeLayer(layer)); // убираем старые маркеры
      let markerRNG: Feature[] = [];
      let markerStyle: Style[] = [];
      this.imageURLs = []; // Удаляем старые иконки маркеров
      this.generateIcons(count).then(() => { // ждем генерации count иконок
      for (let i = 0; i < count; i++) {
        markerRNG.push(new Feature({  // генерируем координаты маркеров
            type: 'rng' + i,
            geometry: new Point([Math.random() * (extent[2] - extent[0]) + extent[0],
              Math.random() * (extent[3] - extent[1]) + extent[1]])
          })
        );
        markerStyle['rng' + i] = (new Style({ // генерируем стили маркеров
          image: new Icon({
            src: this.imageURLs[i],
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
      this.map.addLayer(markerLayer);// добавляем слой на карту
      });
  }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    let style = 'https://api.maptiler.com/maps/basic/style.json?key=BuNi4FPIgsaSVnVlaLoQ';
    this.map = new Map({
      target: 'map',
      view: new View({
        constrainResolution: true,
        center: [4184316.5344758555, 7503867.160605794],
        zoom: 7
      })
    });
    olms(this.map, style);
  }

  async drawToCanvas(svg, context, dx, dy, wx, wy) {
    let svgURL = new XMLSerializer().serializeToString(svg);
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => {
        context.drawImage(img, dx, dy, wx, wy);
        resolve();
      };
      img.src = 'data:image/svg+xml; charset=utf8, '+encodeURIComponent(svgURL);
    })
  }

  async generateIcons(count) {
    return new Promise((resolve, reject) => {
      if (count > 0) {
        this.drawIcon().then(() => {
          count--;
          this.generateIcons(count).then(() => {
            resolve()
          });
        });
      } else {
        resolve()
      }
    })
  }

  async drawIcon() {
    return new Promise((resolve, reject) => {
      let context = this.canvas.nativeElement.getContext('2d');
      context.clearRect(0, 0, 150, 150);
      let rng, color;
      rng = Math.floor(Math.random() * 2); // выбираем одну из двух рамок
      color = '#' + Math.floor(Math.random() * 16777215).toString(16); // выбираем цвет контура рамки и подставки
      document.getElementById('outer' + rng).setAttribute('fill',
        '#' + Math.floor(Math.random() * 16777215).toString(16)); // заливаем рамку
      document.getElementById('outer' + rng).setAttribute('stroke', color); // устанавливаем цвет контура
      document.getElementById('outer' + rng)
        .setAttribute('stroke-width', Math.floor(Math.random() * 30 + 10).toString()); // Ширина контура
      this.drawToCanvas(document.querySelector('#outer' + rng), context, 0, 0, 150, 150).then(() => {// рисуем, ждем отрисовки
        let rng2 = Math.floor(Math.random() * 8); // одна из восьми фигур
        document.getElementById('inner' + rng2).setAttribute('style', `fill:${'#' + Math.floor(Math.random() * 16777215).toString(16)};`);
        // положение фигуры зависит от типа рамки (rng)
        this.drawToCanvas(document.querySelector('#inner' + rng2), context, 15 + 5 * rng, 5 + 10 * rng, 120 - 20 * rng, 120 - 20 * rng).then(() => {
          if (Math.random() >= 0.5) { // выбор наличия подставки
            document.getElementById('outerfoot' + rng).setAttribute('style', `fill:${color}; stroke:${color};`);
            this.drawToCanvas(document.querySelector('#outerfoot' + rng), context, 0, 0, 150, 150).then(() => {// рисуем подставку
              this.imageURLs.push(this.canvas.nativeElement.toDataURL('image/png')); // сохраняем результат
              resolve();
            });
          } else { // сохраняем результат без подставки
            this.imageURLs.push(this.canvas.nativeElement.toDataURL('image/png'));
            resolve();
          }
        });
      });
    });

  }
}
