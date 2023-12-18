import { Component, OnInit, Input, Output, EventEmitter, SimpleChange, ChangeDetectionStrategy } from '@angular/core';
import { DateTimeUtility } from '../../../../../../../core/utilities';
import { MatSelectChange } from '@angular/material';

@Component({
    selector: 'm-time-range-picker',
    templateUrl: './time-range-picker.component.html',
    styleUrls: ['./time-range-picker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeRangePickerComponent implements OnInit {
    @Input() readonly: boolean = false;
    @Input() start: string = "";
    @Input() end: string = "";

    @Output() startTimeChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() endTimeChange: EventEmitter<string> = new EventEmitter<string>();

    startTime: Date = new Date(1970, 0, 1, 9, 0, 0);
    endTime: Date = new Date(1970, 0, 1, 22, 0, 0);

    hourOptions: string[] = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
    minuteOptions: string[] = ["00", "15", "30", "45"];

    selectedOpenHour: string = "";
    selectedOpenMinute: string = "";
    selectedCloseHour: string = "";
    selectedCloseMinute: string = "";

    constructor(private _dateTimeUtil: DateTimeUtility) {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            if (propName === "start") {
                let times = this.start.split(':');
                this.selectedOpenHour = times[0];
                this.selectedOpenMinute = times[1];
            } else if (propName === "end") {
                let times = this.end.split(':');
                this.selectedCloseHour = times[0];
                this.selectedCloseMinute = times[1];
            }
        }
    }


    onOpenHourChange(event: MatSelectChange) {
        this.startTimeChange.emit(this.covertTimeToString(this.selectedOpenHour, this.selectedOpenMinute, "00"));
    }

    onOpenMinuteChange(event: MatSelectChange) {
        this.startTimeChange.emit(this.covertTimeToString(this.selectedOpenHour, this.selectedOpenMinute, "00"));
    }

    onCloseHourChange(event: MatSelectChange) {
        this.endTimeChange.emit(this.covertTimeToString(this.selectedCloseHour, this.selectedCloseMinute, "00"));
    }

    onCloseMinuteChange(event: MatSelectChange) {
        this.endTimeChange.emit(this.covertTimeToString(this.selectedCloseHour, this.selectedCloseMinute, "00"));
    }

    onStartTimeChange() {
        if (this.start !== this._dateTimeUtil.convertTimeToString(this.startTime)) {
            this.startTimeChange.emit(this._dateTimeUtil.convertTimeToString(this.startTime));
        }
    }

    onEndTimeChange() {
        if (this.end !== this._dateTimeUtil.convertTimeToString(this.endTime)) {
            this.endTimeChange.emit(this._dateTimeUtil.convertTimeToString(this.endTime));
        }
    }

    private covertTimeToString(hours: string, minutes: string, seconds: string) {
        let timeString = `${hours}:${minutes}:${seconds}`;
        return timeString;
    }
}
