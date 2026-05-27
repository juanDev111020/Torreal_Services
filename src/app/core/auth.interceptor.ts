import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from './api-base-url';
import { AuthService } from './auth.service';

function esPeticionApiTorreal(url: string): boolean {
  const base = API_BASE_URL.replace(/\/$/, '');
  if (base) {
    const u = url.replace(/\/$/, '');
    return u.startsWith(base) && u.includes('/api/');
  }
  try {
    const path = new URL(url, 'http://local').pathname;
    return path.includes('/api/');
  } catch {
    return url.includes('/api/');
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.obtenerToken();
  if (token && esPeticionApiTorreal(req.url)) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
