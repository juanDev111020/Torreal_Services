import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthApiService } from '../core/auth-api.service';
import { AuthService } from '../core/auth.service';
import { Acceso } from './acceso';

describe('Acceso', () => {
  let component: Acceso;
  let fixture: ComponentFixture<Acceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Acceso],
      providers: [
        provideRouter([]),
        AuthService,
        {
          provide: AuthApiService,
          useValue: {
            login: () =>
              of({
                token: 't',
                usuario: { id: 1, email: 'a@test.com', rol: 'Cliente' },
              }),
            registrar: () => of({ ok: true }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Acceso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
