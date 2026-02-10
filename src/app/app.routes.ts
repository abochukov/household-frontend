import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { Sidebar } from './components/sidebar/sidebar';
import { Checkout } from './components/checkout/checkout';
import { Manage } from './components/manage/manage';
import { CreateAddress } from './components/create-address/create-address';
import { CreateProperty } from './components/create-property/create-property';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'home', component: Home },
    { path: 'checkout', component: Checkout },
    { path: 'manage', component: Manage },
    { path: 'create-address', component: CreateAddress },
    { path: 'create-property', component: CreateProperty },
    { path: '**', redirectTo: '/login' }
];
