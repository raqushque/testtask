export class OLMapOptions { // демонстрационный класс
  center: number[] = []; // можно заприватить, а можно и не
  zoom: number; // можно заприватить, а можно и не

  constructor(cntr, zm) {
    this.center = cntr;
    this.zoom = zm;
  }

  get getCenter(){
    return this.center
  }
  get getZoom(){
    return this.zoom
  }
}
