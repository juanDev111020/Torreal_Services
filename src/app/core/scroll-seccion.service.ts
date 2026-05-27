import { Injectable } from '@angular/core';

/** Desplazamiento extra bajo la cabecera sticky (px). */
const MARGEN_INFERIOR_HEADER = 40;

@Injectable({ providedIn: 'root' })
export class ScrollSeccionService {
  scrollA(fragment: string): void {
    const ejecutar = () => this.ejecutar(fragment);
    requestAnimationFrame(() => requestAnimationFrame(ejecutar));
    setTimeout(ejecutar, 120);
    setTimeout(ejecutar, 350);
  }

  private ejecutar(fragment: string): void {
    const seccion = document.getElementById(fragment);
    if (!seccion) {
      return;
    }

    const titulo = seccion.querySelector<HTMLElement>('.section-title');
    const objetivo = titulo ?? seccion;

    const header = document.querySelector('.main-header');
    const altoHeader =
      header instanceof HTMLElement ? header.getBoundingClientRect().height : 200;
    const top =
      objetivo.getBoundingClientRect().top +
      window.scrollY -
      altoHeader -
      MARGEN_INFERIOR_HEADER;

    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
}
