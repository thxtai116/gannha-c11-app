import { Component, OnInit, ChangeDetectionStrategy, Input, forwardRef, ElementRef, Renderer } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MatDialog } from '@angular/material';

import { environment } from "../../../../../../environments/environment";

import { UtilitiesSelectorComponent } from '../utilities-selector/utilities-selector.component';

import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
    selector: 'm-utilities-carousel',
    templateUrl: './utilities-carousel.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UtilitiesCarouselComponent),
            multi: true,
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UtilitiesCarouselComponent implements OnInit, ControlValueAccessor {
    @Input() readonly: boolean = true;

    private _obsers: any[] = [];

    private _filter: any = {};

    private _onChangeCallback: (_: any) => void = () => { };

    storageEndpoint: string = environment.storageEndpoint;

    viewData: any = {
        utilities$: new BehaviorSubject<string[]>([])
    };

    constructor(
        public dialog: MatDialog,
        private _element: ElementRef,
        private _renderer: Renderer
    ) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: any): void {
        if (obj) {
            this.viewData.utilities$.next(obj);
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    onAdd(): void {
        const data: any = {
            util: this.viewData.utilities$.getValue(),
            filter: this._filter
        }

        const dialogRef = this.dialog.open(UtilitiesSelectorComponent, { data: data, disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(res => {
            this._filter = res.filter;
            if (!res.data)
                return;

            let utilities = this.viewData.utilities$.getValue();

            utilities.push(...res.data);

            this.viewData.utilities$.next(utilities);

            this._onChangeCallback(utilities);

            this.emitChange();

            sub.unsubscribe();
        });
    }

    onRemove(index: number): void {
        let utilities = this.viewData.utilities$.getValue();

        utilities.splice(index, 1);

        this.viewData.utilities$.next(utilities);

        this._onChangeCallback(utilities);

        this.emitChange();
    }

    private emitChange() {
        this._onChangeCallback(this.viewData.utilities$.getValue());

        let event = new CustomEvent('change', { bubbles: true });

        this._renderer.invokeElementMethod(this._element.nativeElement, 'dispatchEvent', [event]);
    }
}
