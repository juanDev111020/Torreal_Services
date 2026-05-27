import { afterNextRender, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { AuthService } from './core/auth.service';
import { ScrollSeccionService } from './core/scroll-seccion.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  title = 'torreal';
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly scrollSeccion = inject(ScrollSeccionService);
  private readonly destroyRef = inject(DestroyRef);

  /** Oculta cabecera y pie del sitio público dentro del módulo empleados. */
  readonly layoutSitioPublico = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(
        (e) =>
          !e.urlAfterRedirects.startsWith('/empleado') &&
          !e.urlAfterRedirects.startsWith('/cliente') &&
          !e.urlAfterRedirects.startsWith('/admin'),
      ),
      startWith(
        !this.router.url.startsWith('/empleado') &&
          !this.router.url.startsWith('/cliente') &&
          !this.router.url.startsWith('/admin'),
      ),
    ),
    {
      initialValue:
        !this.router.url.startsWith('/empleado') &&
        !this.router.url.startsWith('/cliente') &&
        !this.router.url.startsWith('/admin'),
    },
  );

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        const fragment = this.router.parseUrl(e.urlAfterRedirects).fragment;
        if (fragment) {
          this.scrollSeccion.scrollA(fragment);
        }
      });

    afterNextRender(() => {
      const fragment = this.router.parseUrl(this.router.url).fragment;
      if (fragment) {
        this.scrollSeccion.scrollA(fragment);
      }
    });
  }

  irASeccion(fragment: string, event: MouseEvent): void {
    event.preventDefault();
    const enInicio = this.rutaEsInicio(this.router.url);

    if (enInicio) {
      void this.router.navigate(['/'], { fragment, replaceUrl: true }).then(() => {
        this.scrollSeccion.scrollA(fragment);
      });
      return;
    }

    void this.router.navigate(['/'], { fragment }).then(() => {
      this.scrollSeccion.scrollA(fragment);
    });
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
  }

  private rutaEsInicio(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];
    return path === '' || path === '/';
  }
}
