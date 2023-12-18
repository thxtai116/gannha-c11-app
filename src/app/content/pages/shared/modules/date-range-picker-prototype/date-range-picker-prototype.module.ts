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
    MatSelectModule,
    MatMenuModule
} from '@angular/material';

import { TranslateModule } from '@ngx-translate/core';

import { NgxMatDrpModule } from 'ngx-mat-daterange-picker';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { CoreModule } from '../../../../../core/core.module';

import { DateRangePickerPrototypeComponent } from './date-range-picker-prototype.component';

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
        MatMenuModule,

        CoreModule,

        TranslateModule.forChild(),
        
        NgxMatDrpModule,
        NgxDaterangepickerMd.forRoot(),
    ],
    declarations: [
        DateRangePickerPrototypeComponent,
    ],
    exports: [
        DateRangePickerPrototypeComponent,
    ],
})
export class DateRangePickerPrototypeModule { }
