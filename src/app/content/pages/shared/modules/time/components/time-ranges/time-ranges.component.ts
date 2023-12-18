import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { DateTimeUtility } from '../../../../../../../core/core.module';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'm-time-ranges',
    templateUrl: './time-ranges.component.html',
    styleUrls: ['./time-ranges.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TimeRangesComponent),
            multi: true,
        }
    ]
})
export class TimeRangesComponent implements OnInit, ControlValueAccessor {
    @Input() readonly: boolean = true;
    @Input() prototypeMode: boolean = false;

    private _obsers: any[] = [];

    private propagateChange = (value: any) => { };

    displayTimeRanges$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);
    displayTimeRanges: any[] = [];
    displayedColumnsEdit = ['Start', 'End', 'AllDay', 'Actions'];
    displayedColumns = ['Start', 'End'];

    times: any[] = [];

    viewData: any = {
        is24h: false,
    }

    constructor(
        private _dateTimeUtility: DateTimeUtility,
    ) {
        this.times = this.generateTime();
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: any): void {
        if (obj && obj.length > 0) {
            let times: any[] = [];

            for (let time of obj) {

                let is24h = time[0] == 0 && time[1] == 24;

                times.push({ times: time, is24h: is24h });

                this.viewData.is24h = is24h;

            }

            this.displayTimeRanges$.next(times);

            this.displayTimeRanges = JSON.parse(JSON.stringify(times));
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    onCreateTimeRange(): void {
        let timeRange = [8, 22];
        this.displayTimeRanges.push({ times: timeRange, is24h: false });
        this.displayTimeRanges = [...this.displayTimeRanges];

        this.submit();
    }

    onRemoveTimeRange(event): void {
        this.displayTimeRanges.splice(event, 1);
        this.displayTimeRanges = [...this.displayTimeRanges];

        this.submit();
    }

    onIs24hChecked_Prototype(event: any): void {
        if (event) {
            this.displayTimeRanges = [{
                is24h: true,
                times: [0, 24],
            }]
        } else {
            this.displayTimeRanges = [{
                is24h: false,
                times: [8, 22],
            }]
        }

        this.submit();
    }

    onIs24hChecked(event, i): void {
        if (event) {
            this.displayTimeRanges[i]['times'][0] = 0;
            this.displayTimeRanges[i]['times'][1] = 24;
        } else {
            this.displayTimeRanges[i]['times'][0] = 8;
            this.displayTimeRanges[i]['times'][1] = 22;
        }

        this.submit();
    }

    onSelectTime(): void {
        this.propagateChange(this.displayTimeRanges.map(x => x["times"]));
    }

    private submit(): void {
        this.propagateChange(this.displayTimeRanges.map(x => x["times"]));
    }

    private generateTime(): any[] {
        let times: any[] = [];

        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 1; j += 0.25) {
                let value = i + j;

                let time = {
                    value: value,
                    text: this._dateTimeUtility.convertTotalHoursToTimeString(value.toString())
                }

                times.push(time);
            }
        }

        times.push({
            value: 24,
            text: this._dateTimeUtility.convertTotalHoursToTimeString("24")
        });

        return times;
    }
}


