import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { SystemAlertComponent } from '../components/system-alert/system-alert.component';

@Injectable()
export class SystemAlertService {
    constructor(private _snackBar: MatSnackBar) { }

    success(message: string, duration: number = 5000, verticalPosition: 'top' | 'bottom' = 'top') {
        this.show(message, duration, verticalPosition, "success");
    }

    error(message: string, duration: number = 5000, verticalPosition: 'top' | 'bottom' = 'top') {
        this.show(message, duration, verticalPosition, "danger");
    }

    show(message: string, duration: number = 5000, verticalPosition: 'top' | 'bottom' = 'top', panelClass: string = "") {
        return this._snackBar.openFromComponent(SystemAlertComponent, {
            duration: duration,
            data: {
                message,
                snackBar: this._snackBar,
                verticalPosition,
            },
            verticalPosition: verticalPosition,
            panelClass: panelClass
        });
    }
}
