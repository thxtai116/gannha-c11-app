import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../../../../core/core.module';
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
    MatGridListModule,
    MatRippleModule
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { ShiftComponent } from './shift/shift.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { TimeRangePickerComponent } from './time-range-picker/time-range-picker.component';
import { TimeRangePickersComponent } from './time-range-pickers/time-range-pickers.component';
import { TimeRangesComponent } from './time-ranges/time-ranges.component';
import { TimeRangeGridComponent } from './time-range-grid/time-range-grid.component';
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
        MatGridListModule,
        MatRippleModule,
        CoreModule,
        TranslateModule.forChild(),
    ],
    declarations: [
        ShiftComponent,
        ShiftsComponent,
        TimeRangePickerComponent,
        TimeRangePickersComponent,
        TimeRangesComponent,
        TimeRangeGridComponent,
    ],
    exports: [
        ShiftComponent,
        ShiftsComponent,
        TimeRangePickerComponent,
        TimeRangePickersComponent,
        TimeRangesComponent,
        TimeRangeGridComponent,
    ],
})
export class TimeModule { }
