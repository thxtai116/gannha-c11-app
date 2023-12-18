import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import {
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MAT_DIALOG_DEFAULT_OPTIONS,
    MatDialogModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSortModule,
    MatChipsModule
} from '@angular/material';

import { CoreModule } from '../../../../../core/core.module';
import { PartialsModule } from '../../../../partials/partials/partials.module';

import { SingleBrandSelectorComponent } from './components/single-brand-selector.component';

@NgModule({
    imports: [
        CommonModule,
        MatTooltipModule,
        ReactiveFormsModule,
        FormsModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDialogModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatSortModule,
        MatChipsModule,

        CoreModule,
        PartialsModule,

        TranslateModule.forChild(),
    ],
    declarations: [
        SingleBrandSelectorComponent
    ],
    entryComponents: [
        SingleBrandSelectorComponent
    ],
    providers: [
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                hasBackdrop: true,
                panelClass: 'm-mat-dialog-container__wrapper'
            }
        },
    ]
})

export class SingleBrandSelectorModule { }

export * from "./components/single-brand-selector.component";