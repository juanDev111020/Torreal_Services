import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { mensajeErrorApi } from '../core/api-error-message';
import { AuthApiService } from '../core/auth-api.service';
import { AuthService } from '../core/auth.service';
import { nitPhColombiaValidator, validarYNormalizarNitPh } from '../core/nit-colombia';
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
  selector: 'app-acceso',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './acceso.html',
  styleUrl: './acceso.scss',
})
export class Acceso implements OnInit, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly subs = new Subscription();

  readonly vista = signal<'login' | 'registro'>('login');

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly registroForm = this.fb.group(
    {
      tipoCliente: ['natural' as 'natural' | 'propiedad_horizontal'],
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
      direccion: ['', [Validators.maxLength(30)]],
      nitPh: [''],
      personaContacto: [''],
    },
    { validators: [contrasenasCoincidenValidator] },
  );

  readonly cargandoLogin = signal(false);
  readonly cargandoRegistro = signal(false);
  readonly mensajeLogin = signal<string | null>(null);
  readonly mensajeRegistro = signal<string | null>(null);
  readonly mensajeOkRegistro = signal<string | null>(null);

  ngOnInit(): void {
    this.subs.add(
      this.registroForm.get('tipoCliente')!.valueChanges.subscribe(() => this.actualizarRegistro()),
    );
    this.subs.add(
      this.registroForm.get('password')!.valueChanges.subscribe(() => {
        this.registroForm.get('confirmPassword')?.updateValueAndValidity({ emitEvent: false });
        this.registroForm.updateValueAndValidity({ emitEvent: false });
      }),
    );
    this.subs.add(
      this.registroForm.get('confirmPassword')!.valueChanges.subscribe(() => {
        this.registroForm.updateValueAndValidity({ emitEvent: false });
      }),
    );
    this.actualizarRegistro();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  sanitizarTelefono(): void {
    sanitizarTelefonoControl(this.registroForm.get('telefono'));
  }

  actualizarRegistro(): void {
    const tipoClienteCtrl = this.registroForm.get('tipoCliente')!;
    const nit = this.registroForm.get('nitPh')!;
    const pc = this.registroForm.get('personaContacto')!;
    const dir = this.registroForm.get('direccion')!;

    dir.enable({ emitEvent: false });
    const subtipo = tipoClienteCtrl.value;
    if (subtipo === 'propiedad_horizontal') {
      nit.enable({ emitEvent: false });
      nit.setValidators([Validators.required, nitPhColombiaValidator]);
      pc.enable({ emitEvent: false });
      pc.clearValidators();
    } else {
      nit.disable({ emitEvent: false });
      nit.reset('', { emitEvent: false });
      nit.clearValidators();
      pc.disable({ emitEvent: false });
      pc.reset('', { emitEvent: false });
      pc.clearValidators();
    }

    nit.updateValueAndValidity({ emitEvent: false });
    pc.updateValueAndValidity({ emitEvent: false });
  }

  mensajeErrorNombre(): string | null {
    const c = this.registroForm.get('nombreCompleto');
    if (!c?.touched && !c?.dirty) return null;
    if (c.errors?.['required']) return 'El nombre y apellido son obligatorios.';
    if (c.errors?.['pattern']) return 'El nombre no debe contener números ni caracteres especiales.';
    if (c.errors?.['maxlength']) return 'El nombre no debe exceder los 50 caracteres.';
    return null;
  }

  mensajeErrorEmail(): string | null {
    const c = this.registroForm.get('email');
    if (!c?.touched && !c?.dirty) return null;
    if (c.errors?.['required']) return 'El correo electrónico es obligatorio.';
    if (c.errors?.['pattern']) return 'El correo debe ser una dirección @gmail.com válida.';
    if (c.errors?.['maxlength']) return 'El correo no debe exceder los 100 caracteres.';
    return null;
  }

  mensajeErrorPassword(): string | null {
    return mensajeErrorPassword(this.registroForm.get('password'));
  }

  mensajeErrorTelefono(): string | null {
    return mensajeErrorTelefono(this.registroForm.get('telefono'));
  }

  mensajeErrorNitPh(): string | null {
    const c = this.registroForm.get('nitPh');
    if (!c?.touched && !c?.dirty) return null;
    if (c.errors?.['required']) {
      return 'El NIT es obligatorio para propiedad horizontal.';
    }
    if (c.errors?.['nitInvalido']) {
      const r = validarYNormalizarNitPh(String(c.value ?? ''));
      return r.ok ? null : r.error;
    }
    return null;
  }

  mensajeErrorConfirmPassword(): string | null {
    return mensajeErrorConfirmPassword(this.registroForm, this.registroForm.get('confirmPassword'));
  }

  enviarLogin(): void {
    this.mensajeLogin.set(null);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const v = this.loginForm.getRawValue();
    this.cargandoLogin.set(true);
    this.authApi.login(v.email.trim(), v.password).subscribe({
      next: (r) => {
        const token = typeof r?.token === 'string' ? r.token.trim() : '';
        if (!token || !r?.usuario) {
          this.cargandoLogin.set(false);
          this.mensajeLogin.set('La respuesta del servidor no incluyó sesión válida. Intenta de nuevo.');
          return;
        }
        this.auth.guardarSesion(token, r.usuario);
        this.cargandoLogin.set(false);
        if (r.usuario.rol === 'SuperUsuario') {
          void this.router.navigateByUrl('/admin/agendamientos');
        } else if (r.usuario.rol === 'Empleado') {
          void this.router.navigateByUrl('/empleado/calendario');
        } else if (r.usuario.rol === 'Cliente') {
          void this.router.navigateByUrl('/cliente/agendar');
        } else {
          void this.router.navigateByUrl('/');
        }
      },
      error: (err: unknown) => {
        this.cargandoLogin.set(false);
        this.mensajeLogin.set(this.mensajeErrorLogin(err));
      },
    });
  }

  enviarRegistro(): void {
    this.mensajeRegistro.set(null);
    this.mensajeOkRegistro.set(null);
    this.actualizarRegistro();
    this.registroForm.updateValueAndValidity();
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      const c = this.registroForm.controls;
      if (c.nombreCompleto.invalid) {
        if (c.nombreCompleto.errors?.['required']) {
          this.mensajeRegistro.set('El nombre y apellido son obligatorios.');
        } else if (c.nombreCompleto.errors?.['pattern']) {
          this.mensajeRegistro.set('El nombre no debe contener números ni caracteres especiales.');
        } else if (c.nombreCompleto.errors?.['maxlength']) {
          this.mensajeRegistro.set('El nombre no debe exceder los 50 caracteres.');
        }
      } else if (c.email.invalid) {
        if (c.email.errors?.['required']) {
          this.mensajeRegistro.set('El correo electrónico es obligatorio.');
        } else if (c.email.errors?.['pattern']) {
          this.mensajeRegistro.set('El correo debe ser una dirección @gmail.com válida.');
        } else if (c.email.errors?.['maxlength']) {
          this.mensajeRegistro.set('El correo no debe exceder los 100 caracteres.');
        }
      } else if (c.password.invalid) {
        this.mensajeRegistro.set(mensajeErrorPassword(c.password) ?? 'La contraseña es inválida.');
      } else if (c.confirmPassword.invalid) {
        this.mensajeRegistro.set('Confirma tu contraseña.');
      } else if (this.registroForm.errors?.['passwordMismatch']) {
        this.mensajeRegistro.set('Las contraseñas no coinciden.');
      } else if (c.telefono.invalid) {
        this.mensajeRegistro.set('El teléfono debe tener exactamente 10 dígitos.');
      } else {
        this.mensajeRegistro.set('Revisa los campos del formulario.');
      }
      return;
    }
    const raw = this.registroForm.getRawValue();

    let nitPhCliente: string | null = null;
    if (raw.tipoCliente === 'propiedad_horizontal') {
      const r = validarYNormalizarNitPh(raw.nitPh.trim());
      nitPhCliente = r.ok ? r.nit : null;
    }

    const payload = {
      tipo: 'cliente' as const,
      email: raw.email.trim(),
      password: raw.password,
      nombreCompleto: raw.nombreCompleto.trim(),
      telefono: raw.telefono.trim(),
      tipoCliente: raw.tipoCliente,
      direccion: raw.direccion.trim(),
      nitPh: nitPhCliente,
      personaContacto:
        raw.tipoCliente === 'propiedad_horizontal' ? raw.personaContacto.trim() || null : null,
    };

    this.cargandoRegistro.set(true);
    this.authApi.registrar(payload).subscribe({
      next: () => {
        this.cargandoRegistro.set(false);
        this.mensajeOkRegistro.set('Cuenta creada. Ya puedes iniciar sesión.');
        this.vista.set('login');
        this.loginForm.patchValue({ email: raw.email.trim(), password: '' });
        this.registroForm.reset({
          tipoCliente: 'natural',
          nombreCompleto: '',
          email: '',
          password: '',
          confirmPassword: '',
          telefono: '',
          direccion: '',
          nitPh: '',
          personaContacto: '',
        });
        this.actualizarRegistro();
      },
      error: (err: unknown) => {
        this.cargandoRegistro.set(false);
        this.mensajeRegistro.set(this.mensajeErrorRegistro(err));
      },
    });
  }

  private mensajeErrorRegistro(err: unknown): string {
    if (err instanceof HttpErrorResponse && err.status === 409) {
      return 'Ya existe una cuenta con ese correo.';
    }
    return mensajeErrorApi(err, {
      fallback: 'No se pudo crear la cuenta. Intenta de nuevo más tarde.',
    });
  }

  private mensajeErrorLogin(err: unknown): string {
    if (err instanceof HttpErrorResponse && err.status === 401) {
      return 'Credenciales incorrectas.';
    }
    return mensajeErrorApi(err, {
      fallback: 'No se pudo iniciar sesión. Intenta de nuevo más tarde.',
    });
  }
}