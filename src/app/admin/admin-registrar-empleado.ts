import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../core/admin-api.service';
import { mensajeErrorApi } from '../core/api-error-message';
import { ESPECIALIDAD_EMPLEADO_OPCIONES } from '../core/especialidad-empleado-opciones';
import {
  contrasenasCoincidenValidator,
  mensajeErrorConfirmPassword,
  mensajeErrorPassword,
  mensajeErrorTelefono,
  passwordReglasValidator,
  sanitizarTelefonoControl,
  telefonoDiezDigitosValidator,
} from '../core/registro-form-validators';

@Component({
  selector: 'app-admin-registrar-empleado',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-registrar-empleado.html',
  styleUrl: './admin-registrar-empleado.scss',
})
export class AdminRegistrarEmpleado implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(AdminApiService);

  readonly especialidadOpciones = [...ESPECIALIDAD_EMPLEADO_OPCIONES];
  readonly cargando = signal(false);
  readonly mensaje = signal<string | null>(null);
  readonly mensajeEsError = signal(false);

  readonly form = this.fb.group(
    {
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordReglasValidator]],
      confirmPassword: ['', Validators.required],
      telefono: ['', [Validators.required, telefonoDiezDigitosValidator]],
      especialidad: ['', Validators.required],
    },
    { validators: [contrasenasCoincidenValidator] },
  );

  ngOnInit(): void {
    this.form.get('password')!.valueChanges.subscribe(() => {
      this.form.get('confirmPassword')?.updateValueAndValidity({ emitEvent: false });
      this.form.updateValueAndValidity({ emitEvent: false });
    });
    this.form.get('confirmPassword')!.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ emitEvent: false });
    });
  }

  mensajeErrorPassword(): string | null {
    return mensajeErrorPassword(this.form.get('password'));
  }

  mensajeErrorTelefono(): string | null {
    return mensajeErrorTelefono(this.form.get('telefono'));
  }

  mensajeErrorConfirmPassword(): string | null {
    return mensajeErrorConfirmPassword(this.form, this.form.get('confirmPassword'));
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  mensajeErrorNombre(): string | null {
    const c = this.form.get('nombreCompleto');
    if (!c || (!c.touched && !c.dirty)) return null;
    if (c.errors?.['required']) return 'El nombre completo es obligatorio.';
    return null;
  }

  mensajeErrorEmail(): string | null {
    const c = this.form.get('email');
    if (!c || (!c.touched && !c.dirty)) return null;
    if (c.errors?.['required']) return 'El correo electrónico es obligatorio.';
    if (c.errors?.['email']) return 'Ingresa un correo válido (ejemplo@correo.com).';
    return null;
  }

  mensajeErrorEspecialidad(): string | null {
    const c = this.form.get('especialidad');
    if (!c || (!c.touched && !c.dirty)) return null;
    if (c.errors?.['required']) return 'Selecciona una especialidad.';
    return null;
  }

  sanitizarTelefono(): void {
    sanitizarTelefonoControl(this.form.get('telefono'));
  }

  enviar(): void {
    this.mensaje.set(null);
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensajeEsError.set(true);
      if (this.form.errors?.['passwordMismatch']) {
        this.mensaje.set('Las contraseñas no coinciden.');
      } else {
        this.mensaje.set('Revisa los campos del formulario.');
      }
      return;
    }

    const raw = this.form.getRawValue();
    this.cargando.set(true);
    this.api
      .registrarEmpleado({
        email: raw.email.trim(),
        password: raw.password,
        nombreCompleto: raw.nombreCompleto.trim(),
        telefono: raw.telefono.trim(),
        especialidad: raw.especialidad.trim(),
      })
      .subscribe({
        next: () => {
          this.cargando.set(false);
          this.mensajeEsError.set(false);
          this.mensaje.set('Empleado registrado correctamente. Ya puede iniciar sesión.');
          this.form.reset({
            nombreCompleto: '',
            email: '',
            password: '',
            confirmPassword: '',
            telefono: '',
            especialidad: '',
          });
        },
        error: (err: unknown) => {
          this.cargando.set(false);
          this.mensajeEsError.set(true);
          if (err instanceof HttpErrorResponse && err.status === 409) {
            this.mensaje.set('Ya existe una cuenta con ese correo.');
          } else {
            this.mensaje.set(
              mensajeErrorApi(err, {
                fallback: 'No se pudo registrar al empleado. Intenta de nuevo.',
              }),
            );
          }
        },
      });
  }
}
