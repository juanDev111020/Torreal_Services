import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Servicios } from './servicios';

describe('Servicios', () => {
  let component: Servicios;
  let fixture: ComponentFixture<Servicios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Servicios],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Servicios);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
