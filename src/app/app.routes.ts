import { Routes } from '@angular/router';
import { Home } from './home/home';
import { SecurityComponent } from './security/security';

export const routes: Routes = [
     { path: '', redirectTo: '/home', pathMatch: 'full' }, 
{path: 'home', component: Home},
{path: 'security', component: SecurityComponent}




];

