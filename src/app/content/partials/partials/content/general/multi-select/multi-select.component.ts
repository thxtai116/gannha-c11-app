import { Component, OnInit, ChangeDetectionStrategy, forwardRef, Input, ViewChild, ElementRef, Renderer, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, ControlValueAccessor, FormGroupDirective, NgForm, Validators, NgControl } from '@angular/forms';
import { MatSelect, ErrorStateMatcher } from '@angular/material';
import { MatSelectSearchComponent } from 'ngx-mat-select-search';
import { Observable, Subject, ReplaySubject, BehaviorSubject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

export class MatSelectErrorStateMatcher implements ErrorStateMatcher {
    constructor(
        private required: boolean,
    ) { }

    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;

        if (this.required) {
            return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
        }
        return false;
    }
}

@Component({
    selector: 'm-multi-select',
    templateUrl: './multi-select.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiSelectComponent),
            multi: true
        }
    ]
})
export class MultiSelectComponent implements OnInit, ControlValueAccessor {
    @Input("data") data: Observable<any[]> = new Observable<any[]>();
    @Input() required: boolean = false;
    @Input() disabled: boolean = false;

    @Input() set touched(value: boolean) {
        if (value)
            this.selectCtrl.markAsTouched();
        else
            this.selectCtrl.markAsUntouched();
    }

    @ViewChild('multiSelect', { static: true }) mutilSelect: MatSelect;
    @ViewChild('search', { static: true }) search: MatSelectSearchComponent;

    private _data: any[] = [];

    private _onChangeCallback: (_: any) => void = () => { };

    protected _onDestroy = new Subject<void>();

    selectCtrl: FormControl = new FormControl('', [<any>Validators.required]);
    filterCtrl: FormControl = new FormControl();

    matcher: MatSelectErrorStateMatcher;

    filteredData: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    defaultValue: string[] = [];

    ngControl: NgControl;

    constructor(
        private _injector: Injector,
        private _element: ElementRef,
        private _renderer: Renderer) {
    }

    ngOnInit(): void {

        this.data.pipe(takeUntil(this._onDestroy))
            .subscribe(value => {
                this._data = value;

                this.filterData();

                var selected = this._data.filter(x => this.defaultValue.includes(x.id));

                if (selected.length > 0) {
                    this.selectCtrl.setValue(selected);
                    this.setInitialValue();
                }
            });

        this.filterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterData();
            });

        this.selectCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(value => {
                this.defaultValue = value.map(x => x.id);
                this._onChangeCallback(value.map(x => x.id));
                let event = new CustomEvent('change', { bubbles: true });
                this._renderer.invokeElementMethod(this._element.nativeElement, 'dispatchEvent', [event]);
            });

        this.matcher = new MatSelectErrorStateMatcher(this.required);

        const ngControl = this._injector.get(NgControl);

        if (ngControl) {
            this.ngControl = ngControl;
        }
    }
    ngOnDestroy(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    writeValue(obj: string[]): void {
        if (obj && obj.length > 0) {
            this.defaultValue = obj;

            var selected = this._data.filter(x => this.defaultValue.includes(x.id));

            if (selected.length > 0) {
                this.selectCtrl.setValue(selected);
                this.setInitialValue();
            }
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {

    }

    setDisabledState?(isDisabled: boolean): void {

    }

    protected setInitialValue() {
        this.filteredData
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                this.mutilSelect.compareWith = (a: any, b: any) => {
                    return a && b && a.id === b.id;
                };
            });
    }

    protected filterData() {
        if (!this._data) {
            return;
        }

        let search = this.filterCtrl.value;

        if (!search) {
            this.filteredData.next(this._data.slice());
            return;
        } else {
            search = search.toLowerCase();
        }

        this.filteredData.next(
            this._data.filter(entity => entity.text.toLowerCase().indexOf(search) > -1 || entity.id.toLowerCase().indexOf(search) > -1)
        );
    }

}
