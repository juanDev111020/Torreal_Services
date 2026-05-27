import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

const ROL_EMPLEADO = 'Empleado';

export const empleadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.obtenerToken();
  const u = auth.sesion();
  if (!token || !u) {
    return router.createUrlTree(['/acceso'], { queryParams: { motivo: 'sesion' } });
  }
  if (u.rol !== ROL_EMPLEADO) {
    return router.createUrlTree(['/']);
  }
  return true;
};
