import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PostulacionesApiService } from '../core/postulaciones-api.service';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: PostulacionesApiService,
          useValue: { crear: () => of({ id: 1 }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
