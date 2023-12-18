import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    forwardRef,
    OnDestroy,
    ChangeDetectorRef,
} from '@angular/core';

import {
    TimingModel,
    SpecificTimingModel,
    DayOfWeekType,
    DateTimeUtility,
} from '../../../../../../../core/core.module';

import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export class Tile {
    cols: number = 1;
    rows: number = 1;
    time: string = "00:00:00";
    displayTime?: string = "00:00 - 00:30"
    interacting: boolean = false;
    selected: boolean = false;
}

export class TileRow {
    constructor(title: string, tiles: Tile[]) {
        this.title = title;
        this.tiles = tiles;
    }

    title: string = "";
    tiles: Tile[] = [];

    get Is24h() {
        return this.tiles.filter(tile => tile.selected).length == this.tiles.length;
    }
    set Is24h(value: boolean) {
        this.tiles.forEach(tile => {
            tile.selected = value;
        })
    }
}

@Component({
    selector: 'm-time-range-grid',
    templateUrl: './time-range-grid.component.html',
    styleUrls: ['./time-range-grid.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TimeRangeGridComponent),
            multi: true,
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeRangeGridComponent implements OnInit, OnDestroy, ControlValueAccessor {
    private _obsers: any[] = [];

    private _onChangeCallback = (value: any) => { };

    private startingTile: any = { row: -1, col: -1 };

    tiles: Tile[] = [
        { cols: 1, rows: 1, time: "00:00:00", displayTime: "00:00 - 00:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "00:30:00", displayTime: "00:30 - 01:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "01:00:00", displayTime: "01:00 - 01:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "01:30:00", displayTime: "01:30 - 02:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "02:00:00", displayTime: "02:00 - 02:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "02:30:00", displayTime: "02:30 - 03:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "03:00:00", displayTime: "03:00 - 03:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "03:30:00", displayTime: "03:30 - 04:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "04:00:00", displayTime: "04:00 - 04:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "04:30:00", displayTime: "04:30 - 05:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "05:00:00", displayTime: "05:00 - 05:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "05:30:00", displayTime: "05:30 - 06:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "06:00:00", displayTime: "06:00 - 06:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "06:30:00", displayTime: "06:30 - 07:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "07:00:00", displayTime: "07:00 - 07:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "07:30:00", displayTime: "07:30 - 08:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "08:00:00", displayTime: "08:00 - 08:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "08:30:00", displayTime: "08:30 - 09:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "09:00:00", displayTime: "09:00 - 09:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "09:30:00", displayTime: "09:30 - 10:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "10:00:00", displayTime: "10:00 - 10:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "10:30:00", displayTime: "10:30 - 11:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "11:00:00", displayTime: "11:00 - 11:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "11:30:00", displayTime: "11:30 - 12:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "12:00:00", displayTime: "12:00 - 12:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "12:30:00", displayTime: "12:30 - 13:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "13:00:00", displayTime: "13:00 - 13:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "13:30:00", displayTime: "13:30 - 14:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "14:00:00", displayTime: "14:00 - 14:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "14:30:00", displayTime: "14:30 - 15:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "15:00:00", displayTime: "15:00 - 15:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "15:30:00", displayTime: "15:30 - 16:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "16:00:00", displayTime: "16:00 - 16:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "16:30:00", displayTime: "16:30 - 17:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "17:00:00", displayTime: "17:00 - 17:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "17:30:00", displayTime: "17:30 - 18:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "18:00:00", displayTime: "18:00 - 18:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "18:30:00", displayTime: "18:30 - 19:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "19:00:00", displayTime: "19:00 - 19:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "19:30:00", displayTime: "19:30 - 20:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "20:00:00", displayTime: "20:00 - 20:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "20:30:00", displayTime: "20:30 - 21:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "21:00:00", displayTime: "21:00 - 21:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "21:30:00", displayTime: "21:30 - 22:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "22:00:00", displayTime: "22:00 - 22:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "22:30:00", displayTime: "22:30 - 23:00", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "23:00:00", displayTime: "23:00 - 23:30", interacting: false, selected: false },
        { cols: 1, rows: 1, time: "23:30:00", displayTime: "23:30 - 24:00", interacting: false, selected: false },
    ];

    headerRow: any[] = [
        { cols: 6, rows: 1, markerTime: "0:00" },
        { cols: 6, rows: 1, markerTime: "3:00" },
        { cols: 6, rows: 1, markerTime: "6:00" },
        { cols: 6, rows: 1, markerTime: "9:00" },
        { cols: 6, rows: 1, markerTime: "12:00" },
        { cols: 6, rows: 1, markerTime: "15:00" },
        { cols: 6, rows: 1, markerTime: "18:00" },
        { cols: 6, rows: 1, markerTime: "21:00" },
    ];
    rows: TileRow[] = [
        new TileRow("Monday", JSON.parse(JSON.stringify(this.tiles))),
        new TileRow("Tuesday", JSON.parse(JSON.stringify(this.tiles))),
        new TileRow("Wednesday", JSON.parse(JSON.stringify(this.tiles))),
        new TileRow("Thursday", JSON.parse(JSON.stringify(this.tiles))),
        new TileRow("Friday", JSON.parse(JSON.stringify(this.tiles))),
        new TileRow("Saturday", JSON.parse(JSON.stringify(this.tiles))),
        new TileRow("Sunday", JSON.parse(JSON.stringify(this.tiles))),
    ];

    viewControl: any = {
        isSelecting: false,
        isUnselecting: false
    };

    constructor(
        private _dateTimeUtil: DateTimeUtility,
        private _changeRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {

    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: TimingModel): void {
        if (obj) {
            this.parseModelToGrid(obj);

            this._changeRef.detectChanges();
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    onTileMouseOver(row: number, col: number) {
        if (this.viewControl.isSelecting || this.viewControl.isUnselecting) {
            this.updateInteractingTiles(row, col);
        }
    }

    onTileMouseDown(tile: Tile, row: number, col: number) {
        this.startingTile.row = row;
        this.startingTile.col = col;

        this.updateInteractingTiles(row, col);

        if (tile.selected) {
            this.viewControl.isSelecting = false;
            this.viewControl.isUnselecting = true;
        } else {
            this.viewControl.isSelecting = true;
            this.viewControl.isUnselecting = false;
        }
    }

    onTileMouseUp() {
        if (this.viewControl.isSelecting) {
            this.selectTiles();
        } else if (this.viewControl.isUnselecting) {
            this.unelectTiles();
        }

        this.parseGridToModel();

        this.viewControl.isSelecting = false;
        this.viewControl.isUnselecting = false;
    }

    private updateInteractingTiles(endRow: number, endCol: number) {
        this.rows.forEach((row, i) => {
            row.tiles.forEach((tile, j) => {
                tile.interacting = ((i - this.startingTile.row) * (i - endRow)) <= 0 &&
                    ((j - this.startingTile.col) * (j - endCol)) <= 0
            })
        })
    }

    private selectTiles() {
        this.rows.forEach(row => {
            row.tiles.forEach(tile => {
                if (tile.interacting) {
                    tile.selected = true;
                    tile.interacting = false;
                }
            })
        });
    }

    private unelectTiles() {
        this.rows.forEach(row => {
            row.tiles.forEach(tile => {
                if (tile.interacting) {
                    tile.selected = false;
                    tile.interacting = false;
                }
            })
        });
    }

    private parseGridToModel() {
        let timing: TimingModel = new TimingModel();

        timing.Is24H = this.rows.filter(row => row.Is24h).length == this.rows.length;

        this.rows.forEach(row => {
            timing.Specific[row.title] = this.parseRowToModel(row);
        })

        this._onChangeCallback(timing);
    }

    private parseRowToModel(row: TileRow) {
        let hasFrom: boolean = false;
        let result: Array<SpecificTimingModel> = new Array<SpecificTimingModel>();
        let specificTiming: SpecificTimingModel = new SpecificTimingModel();
        specificTiming.Is24H = row.Is24h;

        row.tiles.forEach(tile => {
            if (tile.time == "23:30:00" && tile.selected) {
                if (hasFrom) {
                    hasFrom = false;
                    specificTiming.Close = "24:00:00";
                    result.push(specificTiming);
                    specificTiming = new SpecificTimingModel();
                } else {
                    specificTiming.Open = "23:30:00";
                    specificTiming.Close = "24:00:00";
                    result.push(specificTiming);
                    specificTiming = new SpecificTimingModel();
                }
            } else if (tile.selected && !hasFrom) {
                hasFrom = true;
                specificTiming.Open = tile.time;
            } else if (!tile.selected && hasFrom) {
                hasFrom = false;
                specificTiming.Close = tile.time;
                result.push(specificTiming);
                specificTiming = new SpecificTimingModel();
            }
        });

        return result;
    }

    private parseModelToGrid(timing: TimingModel) {
        if (timing.Is24H) {
            this.selectAllTiles();
        } else if (!!!timing.Specific) {
            this.selectTilesByOfficeHours(timing.Open, timing.Close);
        } else {
            this.selectTilesByTimeRanges(timing.Specific);
        }
    }

    private selectAllTiles() {
        this.rows.forEach(row => {
            row.Is24h = true;
        });
    }

    private selectTilesByOfficeHours(open: string, close: string) {
        open = this._dateTimeUtil.roundUpTime(open);
        close = this._dateTimeUtil.roundUpTime(close);

        this.rows.forEach(row => {
            let selecting: boolean = false;
            row.tiles.forEach(tile => {
                if (tile.time == open) {
                    tile.selected = true;
                    selecting = true;
                } else if (tile.time == close) {
                    selecting = false;
                } else if (selecting) {
                    tile.selected = true;
                }
            })
        });
    }

    private selectTilesByTimeRanges(timeRanges: DayOfWeekType) {
        this.rows.forEach(row => {
            let hasFrom: boolean = false;
            let currentTimeIndex: number = 0;

            if (!timeRanges[row.title] || timeRanges[row.title].length == 0) {
            } else if (timeRanges[row.title][currentTimeIndex].Is24H) {
                row.Is24h = true;
            } else {
                row.tiles.forEach(tile => {
                    if (timeRanges[row.title][currentTimeIndex]) {
                        if (tile.time == this._dateTimeUtil.roundUpTime(timeRanges[row.title][currentTimeIndex].Close)) {
                            hasFrom = false;
                            currentTimeIndex++;
                        } else if (hasFrom) {
                            tile.selected = true;
                        } else if (tile.time == this._dateTimeUtil.roundUpTime(timeRanges[row.title][currentTimeIndex].Open)) {
                            hasFrom = true;
                            tile.selected = true;
                        }
                    }
                })
            }
        })
    }
}
