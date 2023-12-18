import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { GlobalState, UserService, AuthService } from '../../core/core.module';

import { Observable, Subject } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private _router: Router,
        private _userService: UserService,
        private _authService: AuthService,
        private _globalState: GlobalState) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        var activate = new Subject<boolean>();

        console.log(`Authentication status: ${this._globalState.authenticated$.getValue()}`);

        if (this._globalState.authenticated$.getValue()) {
            activate.next(true);
        } else {
            console.log("Trying to proceed authentication");

            Promise.all([
                this._userService.getProfile()
            ]).then(value => {
                if (value[0].Email.length > 0) {
                    console.log("Authentication Successful");

                    this._globalState.authenticated$.next(true);
                    this._globalState.userInfoSub$.next(value[0]);

                    activate.next(true);
                } else {
                    this._authService.initImplicitFlow();
                }
            }).catch(() => {
                console.log("Fail to authenticated. Redirect to login form");

                this._router.navigate(['/404']);

                activate.next(false);
            })
        }

        return activate.asObservable();
    }
}