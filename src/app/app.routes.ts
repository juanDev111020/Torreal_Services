import { Routes } from '@angular/router';

import { AdminAgendamientos } from './admin/admin-agendamientos';
import { AdminClientes } from './admin/admin-clientes';
import { AdminCvs } from './admin/admin-cvs';
import { AdminEmpleados } from './admin/admin-empleados';
import { AdminRegistrarEmpleado } from './admin/admin-registrar-empleado';
import { AdminLayout } from './admin/admin-layout';
import { AdminNovedades } from './admin/admin-novedades';
import { Acceso } from './acceso/acceso';
import { adminGuard } from './core/admin.guard';
import { AgendarServicio } from './cliente/agendar-servicio';
import { ClienteLayout } from './cliente/cliente-layout';
import { PerfilCliente } from './cliente/perfil-cliente';
import { clienteGuard } from './core/cliente.guard';
import { empleadoGuard } from './core/empleado.guard';
import { CalendarioTrabajo } from './empleado/calendario-trabajo';
import { EmpleadoLayout } from './empleado/empleado-layout';
import { PerfilEmpleado } from './empleado/perfil-empleado';
import { Home } from './home/home';
import { Servicios } from './servicios/servicios';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'servicios', component: Servicios },
  { path: 'acceso', component: Acceso },
  {
    path: 'empleado',
    canActivate: [empleadoGuard],
    component: EmpleadoLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'calendario' },
      { path: 'calendario', component: CalendarioTrabajo },
      { path: 'perfil', component: PerfilEmpleado },
    ],
  },
  {
    path: 'cliente',
    canActivate: [clienteGuard],
    component: ClienteLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'agendar' },
      { path: 'agendar', component: AgendarServicio },
      { path: 'perfil', component: PerfilCliente },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'agendamientos' },
      { path: 'agendamientos', component: AdminAgendamientos },
      { path: 'clientes', component: AdminClientes },
      { path: 'empleados', component: AdminEmpleados },
      { path: 'registrar-empleado', component: AdminRegistrarEmpleado },
      { path: 'novedades', component: AdminNovedades },
      { path: 'cvs', component: AdminCvs },
    ],
  },
  { path: '**', redirectTo: '' },
];
