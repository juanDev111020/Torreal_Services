import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { mensajeErrorApi } from '../core/api-error-message';
import { ESPECIALIDAD_EMPLEADO_OPCIONES } from '../core/especialidad-empleado-opciones';
import { NovedadPublica, NovedadesApiService, urlArchivoSubido } from '../core/novedades-api.service';
import { PostulacionesApiService } from '../core/postulaciones-api.service';

export interface VacanteEstructurada {
  modalidad?: string;
  descripcionCorta?: string;
  quienesSomos?: string;
  aQuienBuscamos?: string;
  queHaras?: string;
  requisitos?: string;
  destacar?: string;
  condiciones?: string;
  ofrecemos?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly postulacionesApi = inject(PostulacionesApiService);
  private readonly novedadesApi = inject(NovedadesApiService);

  readonly novedades = signal<NovedadPublica[]>([]);
  readonly indiceCarrusel = signal(0);
  readonly urlImagenNovedad = urlArchivoSubido;

  /** Máximo de tarjetas visibles a la vez (como el diseño original). */
  private readonly visiblePorPaso = 3;

  readonly ventanaNovedades = computed(() => {
    const lista = this.novedades();
    if (lista.length === 0) return [];
    const start = this.indiceCarrusel();
    const out: NovedadPublica[] = [];
    for (let i = 0; i < Math.min(this.visiblePorPaso, lista.length); i++) {
      out.push(lista[(start + i) % lista.length]);
    }
    return out;
  });

  readonly puedeRetroceder = computed(() => this.novedades().length > this.visiblePorPaso);
  readonly puedeAvanzar = computed(() => this.novedades().length > this.visiblePorPaso);

  readonly especialidadOpciones = [...ESPECIALIDAD_EMPLEADO_OPCIONES];

  private readonly cvUploadRef = viewChild<ElementRef<HTMLInputElement>>('cvUpload');

  readonly postulacionForm = this.fb.group({
    nombreCompleto: ['', [
      Validators.required, 
      Validators.maxLength(50), 
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    ]],
    correoElectronico: ['', [
      Validators.required, 
      Validators.maxLength(100), 
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
    ]],
    /** Preferencia opcional (no existe en el ERD de postulaciones; no se envía a la API). */
    areaInteres: [''],
  });

  readonly enviando = signal(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);
  readonly nombreArchivoCv = signal<string | null>(null);
  /** PDF elegido en el explorador de archivos (opcional). */
  readonly archivoCv = signal<File | null>(null);

  // --- Lógica del Modal de Vacantes ---
  readonly modalVacanteAbierto = signal(false);
  readonly vacanteActual = signal<{
    novedad: NovedadPublica;
    datos: VacanteEstructurada | null;
  } | null>(null);

  ngOnInit(): void {
    this.novedadesApi.listar().subscribe({
      next: (lista) => this.novedades.set(lista),
      error: () => this.novedades.set([]),
    });
  }

  carruselAnterior(): void {
    const n = this.novedades().length;
    if (n <= this.visiblePorPaso) return;
    this.indiceCarrusel.update((i) => (i - 1 + n) % n);
  }

  carruselSiguiente(): void {
    const n = this.novedades().length;
    if (n <= this.visiblePorPaso) return;
    this.indiceCarrusel.update((i) => (i + 1) % n);
  }

  abrirVacante(novedad: NovedadPublica): void {
    let datos: VacanteEstructurada | null = null;
    try {
      if (novedad.contenido.trim().startsWith('{')) {
        datos = JSON.parse(novedad.contenido) as VacanteEstructurada;
      }
    } catch {
      // Si falla, se trata como texto plano.
    }
    this.vacanteActual.set({ novedad, datos });
    this.modalVacanteAbierto.set(true);
    document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
  }

  cerrarVacante(): void {
    this.modalVacanteAbierto.set(false);
    this.vacanteActual.set(null);
    document.body.style.overflow = '';
  }

  irAFormulario(): void {
    this.cerrarVacante();
    // Scroll al formulario (href="#formacion" lo hace nativo si se usa ancla,
    // pero aquí lo forzamos por si acaso)
    document.getElementById('formacion')?.scrollIntoView({ behavior: 'smooth' });
  }

  obtenerDescripcion(novedad: NovedadPublica): string {
    try {
      if (novedad.contenido.trim().startsWith('{')) {
        const datos = JSON.parse(novedad.contenido) as VacanteEstructurada;
        return datos.descripcionCorta || 'Oportunidad de trabajo';
      }
    } catch {
      // fallback
    }
    return novedad.contenido;
  }

  separarPorSaltos(texto: string | undefined): string[] {
    if (!texto) return [];
    return texto.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  }

  onArchivoCvChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.archivoCv.set(null);
      this.nombreArchivoCv.set(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      this.mensajeError.set('El CV debe ser un archivo PDF (.pdf).');
      input.value = '';
      this.archivoCv.set(null);
      this.nombreArchivoCv.set(null);
      return;
    }

    this.mensajeError.set(null);
    this.archivoCv.set(file);
    this.nombreArchivoCv.set(file.name);
  }

  abrirSelectorCv(input: HTMLInputElement): void {
    input.click();
  }

  enviarPostulacion(): void {
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    if (this.postulacionForm.invalid) {
      this.postulacionForm.markAllAsTouched();
      const c = this.postulacionForm.controls;
      if (c.nombreCompleto.invalid) {
        if (c.nombreCompleto.errors?.['required']) {
          this.mensajeError.set('Indica tu nombre completo.');
        } else if (c.nombreCompleto.errors?.['pattern']) {
          this.mensajeError.set('El nombre no debe contener números ni caracteres especiales.');
        } else if (c.nombreCompleto.errors?.['maxlength']) {
          this.mensajeError.set('El nombre no debe exceder los 50 caracteres.');
        } else {
          this.mensajeError.set('Indica un nombre válido.');
        }
      } else if (c.correoElectronico.invalid) {
        if (c.correoElectronico.errors?.['required']) {
          this.mensajeError.set('Indica tu correo electrónico.');
        } else if (c.correoElectronico.errors?.['pattern']) {
          this.mensajeError.set('El correo debe ser obligatorio @gmail.com.');
        } else if (c.correoElectronico.errors?.['maxlength']) {
          this.mensajeError.set('El correo no debe exceder los 100 caracteres.');
        } else {
          this.mensajeError.set('Indica un correo electrónico válido (por ejemplo usuario@gmail.com).');
        }
      } else {
        this.mensajeError.set('Revisa los datos del formulario.');
      }
      return;
    }

    const v = this.postulacionForm.getRawValue();
    this.enviando.set(true);

    this.postulacionesApi
      .crear(
        {
          nombreCompleto: v.nombreCompleto.trim(),
          correoElectronico: v.correoElectronico.trim(),
        },
        this.archivoCv(),
      )
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.mensajeExito.set(
            'Postulacion registrada, nos pondremos en contacto contigo muy pronto. Gracias',
          );
          this.postulacionForm.reset();
          this.nombreArchivoCv.set(null);
          this.archivoCv.set(null);
          const input = this.cvUploadRef()?.nativeElement;
          if (input) input.value = '';
        },
        error: (err: unknown) => {
          this.enviando.set(false);
          this.mensajeError.set(
            mensajeErrorApi(err, {
              fallback:
                'No se pudo registrar la postulación. Por favor intenta de nuevo más tarde.',
            }),
          );
        },
      });
  }
}
