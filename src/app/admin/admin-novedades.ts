import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AdminApiService } from '../core/admin-api.service';
import { mensajeErrorApi } from '../core/api-error-message';
import { NovedadPublica, urlArchivoSubido } from '../core/novedades-api.service';

@Component({
  selector: 'app-admin-novedades',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-novedades.html',
  styleUrl: './admin-novedades.scss',
})
export class AdminNovedades implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly cargando = signal(true);
  readonly enviando = signal(false);
  readonly error = signal<string | null>(null);
  readonly mensaje = signal<string | null>(null);
  /** true = error (rojo), false = éxito o aviso de validación. */
  readonly mensajeEsError = signal(false);
  readonly lista = signal<NovedadPublica[]>([]);
  readonly modalEliminarAbierto = signal(false);
  readonly novedadAEliminar = signal<NovedadPublica | null>(null);
  readonly eliminando = signal(false);

  titulo = '';
  contenido = '';
  imagen: File | null = null;
  nombreImagen = '';

  readonly urlImagen = urlArchivoSubido;

  ngOnInit(): void {
    this.recargar();
  }

  recargar(): void {
    this.cargando.set(true);
    this.api.listarNovedades().subscribe({
      next: (rows) => {
        this.lista.set(rows);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeErrorApi(err, { fallback: 'No se pudieron cargar las novedades.' }));
        this.cargando.set(false);
      },
    });
  }

  onImagen(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.imagen = f;
    this.nombreImagen = f?.name ?? '';
  }

  publicar(): void {
    const t = this.titulo.trim();
    const c = this.contenido.trim();
    if (!t || !c || !this.imagen) {
      this.mensajeEsError.set(true);
      this.mensaje.set('Completa título, descripción e imagen.');
      return;
    }
    this.enviando.set(true);
    this.mensaje.set(null);
    this.api.crearNovedad(t, c, this.imagen).subscribe({
      next: () => {
        this.enviando.set(false);
        this.mensajeEsError.set(false);
        this.titulo = '';
        this.contenido = '';
        this.imagen = null;
        this.nombreImagen = '';
        this.mensaje.set('Novedad publicada. Ya aparece en el inicio.');
        this.recargar();
      },
      error: (err) => {
        this.enviando.set(false);
        this.mensajeEsError.set(true);
        this.mensaje.set(mensajeErrorApi(err, { fallback: 'No se pudo publicar la novedad.' }));
      },
    });
  }

  abrirModalEliminar(novedad: NovedadPublica): void {
    this.novedadAEliminar.set(novedad);
    this.modalEliminarAbierto.set(true);
  }

  cerrarModalEliminar(): void {
    if (this.eliminando()) return;
    this.modalEliminarAbierto.set(false);
    this.novedadAEliminar.set(null);
  }

  confirmarEliminar(): void {
    const novedad = this.novedadAEliminar();
    if (!novedad) return;
    this.eliminando.set(true);
    this.mensaje.set(null);
    this.api.eliminarNovedad(novedad.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.modalEliminarAbierto.set(false);
        this.novedadAEliminar.set(null);
        this.mensajeEsError.set(false);
        this.mensaje.set('Novedad eliminada.');
        this.recargar();
      },
      error: (err) => {
        this.eliminando.set(false);
        this.mensajeEsError.set(true);
        this.mensaje.set(mensajeErrorApi(err, { fallback: 'No se pudo eliminar.' }));
      },
    });
  }
}
