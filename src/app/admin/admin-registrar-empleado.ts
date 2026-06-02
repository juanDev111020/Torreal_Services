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
      nombreCompleto: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/),
        ],
      ],
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
    if (c.errors?.['pattern']) return 'El nombre no debe contener números ni caracteres especiales.';
    if (c.errors?.['maxlength']) return 'El nombre no debe exceder los 50 caracteres.';
    return null;
  }

  mensajeErrorEmail(): string | null {
    const c = this.form.get('email');
    if (!c || (!c.touched && !c.dirty)) return null;
    if (c.errors?.['required']) return 'El correo electrónico es obligatorio.';
    if (c.errors?.['pattern']) return 'El correo debe ser una dirección @gmail.com válida.';
    if (c.errors?.['maxlength']) return 'El correo no debe exceder los 100 caracteres.';
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
      const c = this.form.controls;
      if (c.nombreCompleto.invalid) {
        if (c.nombreCompleto.errors?.['required']) {
          this.mensaje.set('El nombre y apellido completo son obligatorios.');
        } else if (c.nombreCompleto.errors?.['pattern']) {
          this.mensaje.set('El nombre no debe contener números ni caracteres especiales.');
        } else if (c.nombreCompleto.errors?.['maxlength']) {
          this.mensaje.set('El nombre no debe exceder los 50 caracteres.');
        }
      } else if (c.email.invalid) {
        if (c.email.errors?.['required']) {
          this.mensaje.set('El correo electrónico es obligatorio.');
        } else if (c.email.errors?.['pattern']) {
          this.mensaje.set('El correo debe ser una dirección @gmail.com válida.');
        } else if (c.email.errors?.['maxlength']) {
          this.mensaje.set('El correo no debe exceder los 100 caracteres.');
        }
      } else if (c.password.invalid) {
        this.mensaje.set(mensajeErrorPassword(c.password) ?? 'La contraseña es inválida.');
      } else if (c.confirmPassword.invalid) {
        this.mensaje.set('Confirma la contraseña.');
      } else if (this.form.errors?.['passwordMismatch']) {
        this.mensaje.set('Las contraseñas no coinciden.');
      } else if (c.telefono.invalid) {
        this.mensaje.set('El teléfono debe tener exactamente 10 dígitos.');
      } else if (c.especialidad.invalid) {
        this.mensaje.set('Selecciona una especialidad.');
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
