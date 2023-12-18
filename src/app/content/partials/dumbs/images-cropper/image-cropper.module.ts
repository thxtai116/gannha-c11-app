import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import {
    MAT_DIALOG_DEFAULT_OPTIONS,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatFormFieldModule,
    MatIconModule
} from '@angular/material';

import { TranslateModule } from '@ngx-translate/core';
import { ImageCropperModule } from "ngx-image-cropper";

import { ImagesCropperComponent } from './components';

import { PartialsModule } from '../../partials/partials.module';

@NgModule({
    declarations: [
        ImagesCropperComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,

        MatDialogModule,
        MatButtonModule,
        MatRadioModule,
        MatFormFieldModule,
        MatIconModule,

        ImageCropperModule,

        PartialsModule,

        TranslateModule,
    ],
    exports: [
        ImagesCropperComponent
    ],
    providers: [
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                hasBackdrop: true,
                panelClass: 'm-mat-dialog-container__wrapper',
                height: 'auto',
                width: 'auto'
            }
        }
    ],
})
export class ImagesCroperModule { }

export * from "./components/index";