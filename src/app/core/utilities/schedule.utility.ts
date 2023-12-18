import { Injectable } from '@angular/core';

import { ScheduleRepeatEveryModel } from "../models/index";

import { ScheduleEveryType, ScheduleOnType } from "../consts/index";

import { DayOfWeek } from "../enums/index";

@Injectable()

export class ScheduleUtility {
    constructor() { }

    toString(repeat: ScheduleRepeatEveryModel, language: string = "vi"): string {
        if (language || language.length === 0) {
            language = "vi";
        }

        let repeatStr = "";

        if (repeat.EveryType === ScheduleEveryType.Daily) {
            repeatStr = language === "vi" ? `Mỗi ${repeat.Every} ngày` : `Every ${repeat.Every} day(s)`;
        } else if (repeat.EveryType === ScheduleEveryType.Weekly) {
            let daysInString = this.getDaysName(repeat.On);

            repeatStr = language === "vi" ?
                `Vào các ngày ${daysInString.join(', ')} mỗi ${repeat.Every} tuần` :
                `Every ${repeat.Every} week(s) on ${daysInString.join(', ')}`;
        } else if (repeat.EveryType === ScheduleEveryType.Monthly) {
            if (repeat.OnType === ScheduleOnType.Day) {
                repeatStr = language === "vi" ? `Vào ngày ${repeat.On[0]} mỗi ${repeat.Every} tháng` : `Every ${repeat.Every} month(s) on day ${repeat.On[0]}`;
            } else if (repeat.OnType === ScheduleOnType.First) {
                repeatStr = language === "vi" ?
                    `Vào ngày ${DayOfWeek[repeat.On[0]]} đầu tiên mỗi ${repeat.Every} tháng` :
                    `Every ${repeat.Every} month(s) on the first ${DayOfWeek[repeat.On[0]]}`;
            } else if (repeat.OnType === ScheduleOnType.Last) {
                repeatStr = language === "vi" ?
                    `Vào ngày ${DayOfWeek[repeat.On[0]]} cuối cùng mỗi ${repeat.Every} tháng` :
                    `Every ${repeat.Every} month(s) on the last ${DayOfWeek[repeat.On[0]]}`;
            } else if (repeat.OnType === ScheduleOnType.Second) {
                repeatStr = language === "vi" ?
                    `Vào ngày ${DayOfWeek[repeat.On[0]]} của tuần thứ hai mỗi ${repeat.Every} tháng` :
                    `Every ${repeat.Every} month(s) on ${DayOfWeek[repeat.On[0]]} of the second week`;
            } else if (repeat.OnType === ScheduleOnType.Third) {
                repeatStr = language === "vi" ?
                    `Vào ngày ${DayOfWeek[repeat.On[0]]} của tuần thứ ba mỗi ${repeat.Every} tháng` :
                    `Every ${repeat.Every} month(s) on ${DayOfWeek[repeat.On[0]]} of the third week`;
            } else if (repeat.OnType === ScheduleOnType.Fourth) {
                repeatStr = language === "vi" ?
                    `Vào ngày ${DayOfWeek[repeat.On[0]]} của tuần thứ tư mỗi ${repeat.Every} tháng` :
                    `Every ${repeat.Every} month(s) on ${DayOfWeek[repeat.On[0]]} of the fourth week`;
            }
        }

        return repeatStr;
    }

    private getDaysName(daysInNumber: number[]): string[] {
        let daysInString: string[] = [];

        for (let day of daysInNumber) {
            daysInString.push(DayOfWeek[day]);
        }

        return daysInString;
    }
}