import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../models/data.models';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (!this.auth.isAuthenticated()) {
            this.router.navigate(['/login']);
            return false;
        }

        const expectedRoles = route.data['roles'] as UserRole[];
        if (!expectedRoles || expectedRoles.length === 0) {
            return true;
        }

        if (this.auth.hasRole(expectedRoles)) {
            return true;
        }

        this.router.navigate(['/dashboard']);
        return false;
    }
}
