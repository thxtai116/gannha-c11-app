import { Injectable } from '@angular/core';

@Injectable()

export class DateTimeUtility {
    roundUpTime(timeString: string): string {
        let time = this.convertStringToTime(timeString)
        let hours = time.getHours();
        let minutes = time.getMinutes();

        if (minutes <= 14) {
            time.setMinutes(0);
        } else if (minutes >= 15 && minutes <= 44) {
            time.setMinutes(30);
        } else if (minutes >= 45) {
            time.setHours(hours + 1);
            time.setMinutes(0)
        }

        return this.convertTimeToString(time);
    }

    convertSecondsToTime(secs: number) {
        let date = new Date();
        date.setHours(Math.floor(secs / 3600));
        date.setMinutes(Math.floor((secs % 3600) / 60));
        date.setSeconds(Math.floor(secs % 60));
        return date;
    }

    convertStringToTime(time: string) {
        let date = new Date(1970, 0, 1);
        let timeArr = time.split(":");
        date.setHours(parseInt(timeArr[0]));
        date.setMinutes(parseInt(timeArr[1]));
        date.setSeconds(0);
        return date;
    }

    convertTimeStringToTotalHours(time: string) {
        let times = time.split(':');
        return +times[0] + Math.ceil(+times[1] / 60 * 100) / 100;
    }

    convertTotalHoursToTimeString(time: string) {
        return Math.floor(+time) + ":" + Math.floor((+time - Math.floor(+time)) * 60);
    }

    convertTotalHoursToTime(time: string) {
        let date = new Date(1970, 0, 1);
        date.setHours(parseInt(time));
        return date;
    }

    convertTimeToString(date: Date) {
        let hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        let seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return `${hours}:${minutes}:${seconds}`;
    }

    convertTimeToHours(date: Date): number {
        return date.getHours() + Math.ceil(date.getMinutes() / 60 * 100) / 100;
    }

    convertDateWithUTC(date: Date): string {
        let convertedDate = "";
        let currentTime = -date.getTimezoneOffset() / 60;
        let currentTimeString = "";

        if (currentTime.toString().length === 1) {
            currentTimeString = currentTime + "00";
        }

        let timeString = `${currentTime >= 0 ? "+" : -""}${currentTime < 10 && currentTime > -10 ? "0" : ""}${currentTimeString}`;

        convertedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}${timeString}`;

        return convertedDate;
    }


    convertStringToDateUTC(date: string, hours: number): Date {
        var covertDate = new Date(date);

        if (!date.includes("+00"))
            covertDate.setHours(covertDate.getHours() + hours);

        return covertDate;
    }

    convertDateWithoutUTC(date: Date): string {
        let convertedDate = "";
        let month = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : "0" + +(date.getMonth() + 1);
        let day = date.getDate() >= 10 ? date.getDate() : "0" + (date.getDate());
        convertedDate = `${date.getFullYear()}-${month}-${day}T00:00:00`;
        return convertedDate;
    }

    convertDateToOnlyDateString(date: Date): string {
        let convertedDate = "";
        let month = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : "0" + +(date.getMonth() + 1);
        let day = date.getDate() >= 10 ? date.getDate() : "0" + (date.getDate());
        convertedDate = `${date.getFullYear()}-${month}-${day}`;
        return convertedDate;
    }
}