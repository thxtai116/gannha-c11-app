import { Component, OnInit, forwardRef, ViewChild, Input, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material';

import { TranslateService } from '@ngx-translate/core';

import * as moment from 'moment';
import { DateRangePipe } from '../../../../../core/pipes';

@Component({
    selector: 'm-date-range-picker-prototype',
    templateUrl: './date-range-picker-prototype.component.html',
    styleUrls: ['date-range-picker-prototype.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateRangePickerPrototypeComponent),
            multi: true
        }
    ],
})
export class DateRangePickerPrototypeComponent implements OnInit, ControlValueAccessor {
    @Input("placeholder") placeholder: string = "";
    @Input("allowPreset")
    set allowPreset(value: boolean) {
        this.setupPresets(value);
    }

    @ViewChild(MatMenuTrigger, { static: false }) menuTrigger: MatMenuTrigger;

    dateRange = [new Date(), new Date()];
    ranges: any = {};

    displayValue: string = "Hey Hey";

    ngControl: NgControl;

    private _onChangeCallback: (_: any) => void = () => { };

    constructor(
        private _translate: TranslateService,
        private _injector: Injector,
    ) { }

    ngOnInit(): void {
        this.setupPresets();
    }

    ngAfterViewInit(): void {
        this.initFormControl();
    }

    writeValue(obj: any): void {
        if (obj) {
            this.dateRange = [obj[0], obj[1]];

            this.displayValue = new DateRangePipe().transform(this.dateRange);
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    onDateRangeSelected(event) {
        this.dateRange = [event.startDate.toDate(), event.endDate.toDate()];

        this._onChangeCallback(this.dateRange);

        this.displayValue = new DateRangePipe().transform(this.dateRange);

        this.menuTrigger.closeMenu();
    }

    onRangeSelected(event) {
        this.dateRange = [event.dates[0].toDate(), event.dates[1].toDate()];

        this._onChangeCallback(this.dateRange);

        this.displayValue = new DateRangePipe().transform(this.dateRange);

        this.menuTrigger.closeMenu();
    }

    private setupPresets(allowPreset: boolean = false) {
        if (allowPreset) {
            this.ranges[this._translate.instant("DATE_RANGE.YESTERDAY")] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
            this.ranges[this._translate.instant("DATE_RANGE.LAST_SEVEN_DAYS")] = [moment().subtract(6, 'days'), moment()];
            this.ranges[this._translate.instant("DATE_RANGE.LAST_THIRTY_DAYS")] = [moment().subtract(29, 'days'), moment()];
            this.ranges[this._translate.instant("DATE_RANGE.THIS_MONTH")] = [moment().startOf('month'), moment().endOf('month')];
            this.ranges[this._translate.instant("DATE_RANGE.LAST_MONTH")] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
        } else {
            this.ranges = {};
        }
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