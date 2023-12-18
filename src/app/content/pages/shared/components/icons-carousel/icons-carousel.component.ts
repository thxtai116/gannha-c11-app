import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    Input,
    Output,
    EventEmitter,
    forwardRef,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MatDialog } from '@angular/material';

import { environment } from "../../../../../../environments/environment";
import { IconsSelectorComponent } from '../icons-selector/icons-selector.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'm-icons-carousel',
    templateUrl: './icons-carousel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IconsCarouselComponent),
            multi: true,
        }
    ]
})
export class IconsCarouselComponent implements OnInit, ControlValueAccessor {

    @Input() readonly: boolean = true;

    storageEndpoint: string = environment.storageEndpoint;

    private _onChangeCallback = (value: any) => { };
    private _obsers: any[] = [];
    private _filter: any = {
        'text': ""
    }

    viewData: any = {
        icons$: new BehaviorSubject<string[]>([]),
    }

    constructor(
        public dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
    }

    writeValue(obj: string[]): void {
        if (obj) {
            this.viewData.icons$.next(obj)
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    onAdd(): void {
        const data: any = {
            "initialResource": this.viewData.icons$.getValue(),
            "isSingle": true, //Story of my life 😂
            filter: this._filter
        }

        const dialogRef = this.dialog.open(IconsSelectorComponent, {
            data: data,
            disableClose: true
        });

        let sub = dialogRef.afterClosed().subscribe(res => {
            this._filter = res.filter;
            if (!res.data)
                return;

            this.viewData.icons$.next(res.data);
            this._onChangeCallback(this.viewData.icons$.getValue());

            sub.unsubscribe();
        });
    }

    onRemove(event: string): void {
        this.viewData.icons$.getValue().splice(this.viewData.icons$.getValue().indexOf(event), 1);
        this._onChangeCallback(this.viewData.icons$.getValue())
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.viewData.icons$.subscribe(() => {
            })
        );
    }
}
