import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class IconGeneratorService {
  private outerImageURLs = ['/assets/icons/outer0.svg', '/assets/icons/outer1.svg'];
  private outerRingURLs = ['/assets/icons/outerring0.svg', '/assets/icons/outerring1.svg'];
  private innerImageURLs = ['/assets/icons/inner0.svg', '/assets/icons/inner1.svg', '/assets/icons/inner2.svg',
    '/assets/icons/inner3.svg', '/assets/icons/inner4.svg', '/assets/icons/inner5.svg', '/assets/icons/inner6.svg',
    '/assets/icons/inner7.svg']; // в идеале запрашивать это с сервера
  private generatedImages: string[] = [];
  private outerImages: string[] = [];
  private outerRings: string[] = [];
  private innerImages: string[] = [];
  preloadDone = false;
  constructor(private http: HttpClient) {
    this.preloadImages(this.outerImageURLs, this.outerImages).then(() => {
      this.preloadImages(this.outerRingURLs, this.outerRings).then(() => {
        this.preloadImages(this.innerImageURLs, this.innerImages).then(() => {
          this.preloadDone = true; /* теоретически возможно, что изображения не успеют загрузиться перед вызовом
                                      drawIcon, однако в случае с локальными файлами, вероятность крайне мала
                                      для таких случаев оставлен флаг завершенности предзагрузки preloadDone, который в
                                      можно использовать для ограничения вызова drawIcon */
        });
      });
    });
  }

  private async preloadImages(array, target) { // управляет предзагрузкой изображений
    return new Promise(async (resolve) => {
      for (const [i, item] of array.entries()) {
        await this.getImages(item, target, i)
      }
      resolve();
    });
  }
  private async getImages(item, target, i) { // загружает изображения из ассетов и сохраняет в локальном массиве
    return new Promise(resolve => {
      this.getIcon(item)
        .subscribe(res => {
          target[i] = res;
          resolve();
        })
    });
  }
  private async drawToCanvas(svg, context, dx, dy, wx, wy) { // рисует изображение на канву
    let svgURL = new XMLSerializer().serializeToString(svg);
    return new Promise((resolve) => {
      let img = new Image();
      img.onload = () => {
        context.drawImage(img, dx, dy, wx, wy);
        resolve();
      };
      img.src = 'data:image/svg+xml; charset=utf8, '+encodeURIComponent(svgURL);
    })
  }

  async createIconsArray(amount) { // основная функция, вызывается извне
    this.generatedImages = [];
    let canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    return new Promise<string[]>((resolve, reject) => {
      this.generateIcons(amount, canvas).then(() => {
        resolve(this.generatedImages);
      }).catch(() => reject())
    })
  }

  private async generateIcons(count, canvas) { // генерирует count иконок, используя для этого canvas
    return new Promise((resolve, reject) => {
      if (count > 0) {
        this.drawIcon(canvas).then(res => {
          this.generatedImages.push(res);
          count--;
          this.generateIcons(count, canvas).then(() => {
            resolve()
          });
        }).catch(() => {
          reject();
        });
      } else {
        resolve()
      }
    })
  }

  private async drawIcon(canvas) { // рисует иконку на основе ассетов и рандома
    let parser = new DOMParser();
    let context = canvas.getContext('2d');
    return new Promise<string>((resolve, reject) => {
      if (this.preloadDone === false) reject();
      context.clearRect(0, 0, 150, 150);
      let rng, color, rng2;
      rng = Math.floor(Math.random() * 2); // выбираем одну из двух рамок
      rng2 = Math.floor(Math.random() * 8); // одна из восьми фигур
      color = '#' + Math.floor(Math.random() * 16777215).toString(16); // выбираем цвет контура рамки и подставки
      let dom = parser.parseFromString(this.outerImages[rng], 'text/xml').documentElement;
      dom.setAttribute('fill',
        '#' + Math.floor(Math.random() * 16777215).toString(16)); // заливаем рамку
      dom.setAttribute('stroke', color); // устанавливаем цвет контура
      dom.setAttribute('stroke-width', Math.floor(Math.random() * 30 + 10).toString()); // Ширина контура
      this.drawToCanvas(dom, context, 0, 0, 150, 150).then(() => { // рисуем, ждем отрисовки
        let dom = parser.parseFromString(this.innerImages[rng2], 'text/xml').documentElement;
        dom.setAttribute('style', `fill:${'#' + Math.floor(Math.random() * 16777215).toString(16)};`);
        this.drawToCanvas(dom, context, 15 + 5 * rng, 5 + 10 * rng, 120 - 20 * rng, 120 - 20 * rng).then(() => {
          if (Math.random() >= 0.5) { // выбор наличия подставки
            let dom = parser.parseFromString(this.outerRings[rng], 'text/xml').documentElement;
            dom.setAttribute('style', `fill:${color}; stroke:${color};`);
            this.drawToCanvas(dom, context, 0, 0, 150, 150).then(() => {
              resolve(canvas.toDataURL('image/png'));
            })
          } else {
            resolve(canvas.toDataURL('image/png'));
          }
        });
      });
    });
  }

  private getIcon(url: string): Observable<any> { // загружает одно изображение
    return this.http.get(url, {responseType: 'text'});
  }
}
