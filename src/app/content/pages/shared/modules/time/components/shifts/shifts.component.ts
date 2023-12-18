import { Component, OnInit, Input, Output, EventEmitter, SimpleChange, ChangeDetectionStrategy, forwardRef, ChangeDetectorRef } from '@angular/core';
import { TimingModel, ShiftModel, ShiftsUtility } from '../../../../../../../core/core.module';
import { BehaviorSubject } from 'rxjs';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
    selector: 'm-shifts',
    templateUrl: './shifts.component.html',
    styleUrls: ['./shifts.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ShiftsComponent),
            multi: true,
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShiftsComponent implements OnInit, ControlValueAccessor {
    @Input() readonly: boolean = true;
    @Input() timing$: BehaviorSubject<TimingModel> = new BehaviorSubject<TimingModel>(new TimingModel());

    @Output() shiftsChange: EventEmitter<TimingModel> = new EventEmitter<TimingModel>();
    @Output() validate: EventEmitter<boolean> = new EventEmitter<boolean>();

    shifts: ShiftModel[] = [];

    noShifts: boolean = false;

    officeHours: Boolean = false;

    ignore: Boolean = false;

    private _obsers: any[] = [];

    private _onChangeCallback = (value: any) => { };

    constructor(
        private _shiftUtil: ShiftsUtility,
        private _changeRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.validate.emit(this._shiftUtil.validate(this.shifts));
        this.bindSubscribe();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: TimingModel): void {
        if (obj) {
            this.timing$.next(obj);
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            if (propName === "timing") {
                if (this.ignore) return;

                this.displayShifts(this.timing$.getValue());
            }
        }
    }

    private displayShifts(timing: TimingModel) {
        if (timing.Is24H) {
            this.shifts = this._shiftUtil.convert24hToShifts();
            this.noShifts = false;
            return;
        } else if (this.isOfficeHours(timing)) {
            this.shifts = this._shiftUtil.convertOfficeHoursToShifts(timing);
            this.officeHours = true;
            this.noShifts = false;
            return;
        } else {
            this.shifts = this._shiftUtil.convertDayOfWeekToShifts(timing.Specific);
            this.noShifts = this.shifts.filter(x => x.Active).length === 0;
            return;
        }
    }

    private isOfficeHours(timing: TimingModel): boolean {
        if (!timing.Is24H && !timing.Specific) {
            return true;
        }
        return false;
    }

    onShiftChange(event: ShiftModel, index: number) {
        let shift: ShiftModel = this.shifts[index];
        if (shift) {
            this.shifts[index] = event;
        }
        // this.noShifts = this.shifts.filter(x => x.Active).length === 0;
        let timing = this._shiftUtil.convertShiftsToSpecificTiming(this.shifts);
        this.shiftsChange.emit(timing);
        this._onChangeCallback(timing);
        this.ignore = true;
    }

    private bindSubscribe() {
        this._obsers.push(this.timing$.subscribe(value => {
            this.displayShifts(value);
            this._changeRef.detectChanges();
        }));
    }
}
