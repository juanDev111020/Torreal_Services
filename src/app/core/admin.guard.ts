import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

const ROL_SUPER = 'SuperUsuario';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const u = auth.sesion();
  if (!auth.obtenerToken() || !u) {
    return router.createUrlTree(['/acceso']);
  }
  if (u.rol !== ROL_SUPER) {
    return router.createUrlTree(['/']);
  }
  return true;
};
