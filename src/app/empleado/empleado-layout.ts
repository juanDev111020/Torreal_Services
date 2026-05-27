import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-empleado-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './empleado-layout.html',
  styleUrl: './empleado-layout.scss',
})
export class EmpleadoLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly menuPerfilAbierto = signal(false);

  readonly nombreBienvenida = () => {
    const u = this.auth.sesion();
    const n = u?.nombreCompleto?.trim();
    if (n) return n;
    return u?.email ?? 'usuario';
  };

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuPerfilAbierto.set(false));
  }

  alternarMenuPerfil(ev: MouseEvent): void {
    ev.stopPropagation();
    this.menuPerfilAbierto.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  cerrarMenuSiFuera(ev: MouseEvent): void {
    if (!this.menuPerfilAbierto()) return;
    const t = ev.target as Node | null;
    if (!t) return;
    const root = this.host.nativeElement;
    const acciones = root.querySelector('.header-acciones');
    if (acciones && acciones.contains(t)) return;
    this.menuPerfilAbierto.set(false);
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.menuPerfilAbierto.set(false);
    void this.router.navigateByUrl('/');
  }
}
