import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, forwardRef, OnDestroy, Injector } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatAutocomplete, MatChipInputEvent, MatAutocompleteSelectedEvent } from '@angular/material';
import { startWith, map } from 'rxjs/operators';

@Component({
    selector: 'm-tags',
    templateUrl: './tags.component.html',
    styleUrls: ['./tags.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TagsComponent),
            multi: true,
        }
    ]
})
export class TagsComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() autoComplete: boolean = false;
    @Input() addInAutoComplete: boolean = false;
    @Input() max: number;
    @Input() data: any[] = [];
    @Input() readonly: boolean = false;

    @ViewChild('tagsInput', { static: false }) tagsInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

    private _onChangeCallback = (value: any) => { };
    private _obsers: any[] = [];

    selectedData: any[] = [];
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    tagsCtrl = new FormControl();

    filteredData: Observable<any[]>;

    viewData: any = {
        tags$: new BehaviorSubject<any[]>([]),
    }

    ngControl: NgControl;

    constructor(private _injector: Injector, ) {
        this.filteredData = this.tagsCtrl.valueChanges.pipe(
            startWith(null),
            map((selectedData: string | null) => selectedData ? this._filter(selectedData) : this.data.slice()));
    }

    ngOnInit(): void {
        this.initFormControl();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: any): void {
        if (obj) {
            this.viewData.tags$.next(obj);
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    add(event: MatChipInputEvent): void {
        // Add fruit only when MatAutocomplete is not open
        // To make sure this does not conflict with OptionSelected Event
        if (!this.matAutocomplete.isOpen) {
            if (this.autoComplete && !this.addInAutoComplete)
                return;

            if (this.max && this.viewData.tags$.getValue().length >= this.max)
                return;

            const input = event.input;
            const value = event.value;

            if (this.viewData.tags$.getValue().find(x => x.Name.toLowerCase() === value.toLowerCase()))
                return;

            // Add our fruit
            if ((value || '').trim()) {
                this.viewData.tags$.getValue().push({ Id: "", Name: value.trim() });
            }

            // Reset the input value
            if (input) {
                input.value = '';
            }

            this.tagsCtrl.setValue(null);
            this._onChangeCallback(this.viewData.tags$.getValue());
        }
    }

    remove(data: string): void {
        const index = this.viewData.tags$.getValue().indexOf(data);
        if (index >= 0) {
            this.viewData.tags$.getValue().splice(index, 1);
        }
        this._onChangeCallback(this.viewData.tags$.getValue());
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        if (this.max && this.viewData.tags$.getValue().length >= this.max)
            return;

        if (this.viewData.tags$.getValue().filter(x => x.Id == event.option.value.Id).length > 0) return;

        this.viewData.tags$.getValue().push({ Id: event.option.value.Id, Name: event.option.value.Name });

        this.tagsInput.nativeElement.value = '';

        this.tagsCtrl.setValue(null);

        this._onChangeCallback(this.viewData.tags$.getValue());
    }

    private bindSubscribes() {
        this._obsers.push(this.viewData.tags$.subscribe(value => {
            this.selectedData = value;
        }))
    }

    private _filter(value: any): string[] {
        const filterValue = value.Name ? value.Name.toLowerCase() : value.toLowerCase();
        return this.data.filter(x => x.Name.toLowerCase().indexOf(filterValue) === 0);
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
