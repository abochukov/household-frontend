import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { Sidebar } from './components/sidebar/sidebar';
import { Checkout } from './components/checkout/checkout';
import { Manage } from './components/manage/manage';
import { CreateAddress } from './components/create-address/create-address';
import { CreateProperty } from './components/create-property/create-property';
import { LandingComponent } from './components/landing/landing';
import { ApartamentDetails } from './components/manage/apartament-details';
import { Invoices } from './components/invoices/invoices';
import { authGuard } from './guards/auth.guard';
import { Help } from './components/help/help';
import { UserProfileComponent } from './components/user-profile/user-profile';
import { Signup } from './components/signup/signup';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { ResetPassword } from './components/reset-password/reset-password';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'reset-password', component: ResetPassword },
    { path: 'home', component: Home, canActivate: [authGuard] },
    { path: 'checkout', component: Checkout, canActivate: [authGuard] },
    { path: 'manage', component: Manage, canActivate: [authGuard] },
    { path: 'apartament/:id', component: ApartamentDetails, canActivate: [authGuard] },
    { path: 'create-address', component: CreateAddress, canActivate: [authGuard] },
    { path: 'create-property', component: CreateProperty, canActivate: [authGuard] },
    { path: 'invoices', component: Invoices, canActivate: [authGuard] },
    { path: 'user-profile', component: UserProfileComponent, canActivate: [authGuard] },
    { path: 'help', component: Help, canActivate: [authGuard] },
    { path: '**', redirectTo: '/' }
];
