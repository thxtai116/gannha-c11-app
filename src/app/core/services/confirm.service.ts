import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable()
export class ConfirmService {
    constructor(private dialog: MatDialog) { }

    show(title: string = '', description: string = '', isHTML: boolean = false) {
        return this.dialog.open(ConfirmDialogComponent, {
            data: {
                title,
                description,
                isHTML
            },
            disableClose: true,
            panelClass: ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation']
        });
    }
}
