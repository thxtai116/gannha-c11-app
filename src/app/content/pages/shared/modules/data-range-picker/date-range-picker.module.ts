import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import {
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
} from '@angular/material';

import { TranslateModule } from '@ngx-translate/core';

import { NgxMatDrpModule } from 'ngx-mat-daterange-picker';

import { CoreModule } from '../../../../../core/core.module';

import { DateRangePickerComponent } from './date-range-picker.component';

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

        CoreModule,

        TranslateModule.forChild(),
        
        NgxMatDrpModule,
    ],
    declarations: [
        DateRangePickerComponent
    ],
    exports: [
        DateRangePickerComponent
    ],
})
export class DateRangePickerModule { }
