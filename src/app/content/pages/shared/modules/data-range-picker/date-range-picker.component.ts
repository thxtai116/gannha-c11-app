import { Component, OnInit, forwardRef, ViewChild, Input, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';

import { NgxDrpOptions, PresetItem, Range } from 'ngx-mat-daterange-picker';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-date-range-picker',
    templateUrl: './date-range-picker.component.html',
    styleUrls: ['./date-range-picker.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateRangePickerComponent),
            multi: true
        }
    ],
})
export class DateRangePickerComponent implements OnInit, ControlValueAccessor {

    @Input("placeholder") placeholder: string = " ";
    @Input("allowPreset") allowPreset: boolean = true;

    @ViewChild('dateRangePicker', { static: true }) dateRangePicker;

    range: Range = { fromDate: new Date(), toDate: new Date() };
    options: NgxDrpOptions;
    presets: Array<PresetItem> = [];

    ngControl: NgControl;

    private _onChangeCallback: (_: any) => void = () => { };

    constructor(
        private _translate: TranslateService,
        private _injector: Injector) {
    }

    ngOnInit(): void {
        this.initFormControl();
        this.setupPresets();
        this.options = {
            presets: this.allowPreset ? [] : this.presets,
            format: 'mediumDate',
            range: this.range,
            applyLabel: this._translate.instant("COMMON.SELECT"),
            cancelLabel: this._translate.instant("COMMON.CLOSE"),
            calendarOverlayConfig: {
                shouldCloseOnBackdropClick: true,
                hasBackdrop: true,
            },
            placeholder: this.placeholder
        };
    }

    writeValue(obj: any): void {
        if (obj) {
            const range: Range = { fromDate: obj[0], toDate: obj[1] };

            this.options.range = range;

            this.dateRangePicker.resetDates(range);
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState?(isDisabled: boolean): void {
    }

    updateRange(range: Range) {
        this.range = range;

        this._onChangeCallback([this.range.fromDate, this.range.toDate]);
    }

    // helper function to create initial presets
    setupPresets() {

        const backDate = (numOfDays) => {
            const today = new Date();
            return new Date(today.setDate(today.getDate() - numOfDays));
        }

        const today = new Date();
        const yesterday = backDate(1);
        const minus7 = backDate(7)
        const minus30 = backDate(30);
        const currMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const currMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        this.presets = [
            { presetLabel: this._translate.instant("DATE_RANGE.YESTERDAY"), range: { fromDate: yesterday, toDate: today } },
            { presetLabel: this._translate.instant("DATE_RANGE.LAST_SEVEN_DAYS"), range: { fromDate: minus7, toDate: today } },
            { presetLabel: this._translate.instant("DATE_RANGE.LAST_THIRTY_DAYS"), range: { fromDate: minus30, toDate: today } },
            { presetLabel: this._translate.instant("DATE_RANGE.THIS_MONTH"), range: { fromDate: currMonthStart, toDate: currMonthEnd } },
            { presetLabel: this._translate.instant("DATE_RANGE.LAST_MONTH"), range: { fromDate: lastMonthStart, toDate: lastMonthEnd } }
        ]
    }

    private initFormControl(): void {
        try {
            const ngControl = this._injector.get(NgControl);

            if (ngControl) {
                this.ngControl = ngControl;
            }
        } catch (error) {
            console.log("FormControl or ngModel required");
        }
    }
}
