import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { Sidebar } from './components/sidebar/sidebar';
import { Checkout } from './components/checkout/checkout';
import { Manage } from './components/manage/manage';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'home', component: Home },
    { path: 'checkout', component: Checkout },
    { path: 'manage', component: Manage },
    { path: 'create-address', component: Home }, // TODO: Replace with actual component
    { path: 'create-property', component: Home }, // TODO: Replace with actual component
    { path: '**', redirectTo: '/login' }
];
