import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

export function passwordReglasValidator(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '');
  if (!v) return null;
  if (v.length < 8 || v.length > 16) {
    return { longitudPassword: true };
  }
  if (!/[A-Z]/.test(v)) {
    return { mayusculaPassword: true };
  }
  return null;
}

export function telefonoDiezDigitosValidator(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '');
  if (!v) return null;
  if (!/^\d{10}$/.test(v)) {
    return { telefonoInvalido: true };
  }
  return null;
}

export function contrasenasCoincidenValidator(group: AbstractControl): ValidationErrors | null {
  const g = group as FormGroup;
  const p = g.get('password')?.value ?? '';
  const c = g.get('confirmPassword')?.value ?? '';
  if (!c && !p) return null;
  if (p !== c) {
    return { passwordMismatch: true };
  }
  return null;
}

export function mensajeErrorPassword(control: AbstractControl | null): string | null {
  if (!control?.touched && !control?.dirty) return null;
  if (control.errors?.['required']) return 'La contraseña es obligatoria.';
  if (control.errors?.['longitudPassword']) {
    return 'La contraseña debe tener entre 8 y 16 caracteres.';
  }
  if (control.errors?.['mayusculaPassword']) {
    return 'Incluye al menos una letra mayúscula (A-Z).';
  }
  return null;
}

export function mensajeErrorTelefono(control: AbstractControl | null): string | null {
  if (!control?.touched && !control?.dirty) return null;
  if (control.errors?.['required']) return 'El teléfono es obligatorio.';
  if (control.errors?.['telefonoInvalido']) {
    return 'El teléfono debe tener exactamente 10 dígitos (solo números).';
  }
  return null;
}

export function mensajeErrorConfirmPassword(
  form: FormGroup,
  control: AbstractControl | null,
): string | null {
  if (!control?.touched && !control?.dirty) return null;
  if (control.errors?.['required']) return 'Confirma tu contraseña.';
  if (form.errors?.['passwordMismatch'] && control.value) {
    return 'Las contraseñas no coinciden.';
  }
  return null;
}

export function sanitizarTelefonoControl(control: AbstractControl | null): void {
  if (!control) return;
  const solo = String(control.value ?? '').replace(/\D/g, '').slice(0, 10);
  control.setValue(solo, { emitEvent: true });
}
