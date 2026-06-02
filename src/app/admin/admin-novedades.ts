import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../core/admin-api.service';
import { mensajeErrorApi } from '../core/api-error-message';
import { NovedadPublica, urlArchivoSubido } from '../core/novedades-api.service';

@Component({
  selector: 'app-admin-novedades',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-novedades.html',
  styleUrl: './admin-novedades.scss',
})
export class AdminNovedades implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
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

  novedadForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(30)]],
    modalidad: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[^0-9]*$/)]],
    descripcionCorta: ['', Validators.required],
    quienesSomos: [''],
    aQuienBuscamos: [''],
    queHaras: [''],
    requisitos: [''],
    destacar: [''],
    condiciones: [''],
    ofrecemos: ['']
  });

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
    if (this.novedadForm.invalid || !this.imagen) {
      this.novedadForm.markAllAsTouched();
      this.mensajeEsError.set(true);
      this.mensaje.set('Completa los campos obligatorios e incluye una imagen.');
      return;
    }
    const raw = this.novedadForm.getRawValue();
    const tituloStr = raw.titulo.trim();
    
    // Crear el objeto JSON que se guardará en la base de datos
    const vacanteJSON = JSON.stringify({
      modalidad: raw.modalidad.trim(),
      descripcionCorta: raw.descripcionCorta.trim(),
      quienesSomos: raw.quienesSomos.trim(),
      aQuienBuscamos: raw.aQuienBuscamos.trim(),
      queHaras: raw.queHaras.trim(),
      requisitos: raw.requisitos.trim(),
      destacar: raw.destacar.trim(),
      condiciones: raw.condiciones.trim(),
      ofrecemos: raw.ofrecemos.trim(),
    });

    this.enviando.set(true);
    this.mensaje.set(null);
    this.api.crearNovedad(tituloStr, vacanteJSON, this.imagen).subscribe({
      next: () => {
        this.enviando.set(false);
        this.mensajeEsError.set(false);
        this.novedadForm.reset();
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
