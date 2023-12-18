import { Component, OnInit, Input, Injectable, forwardRef } from '@angular/core';
import { FormGroup, Validators, FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';


import {
    PhoneModel,
    PhoneViewModel,

    CommonUtility,

    PhoneType,

    PhoneTransformer,

    ValidatorService,
    TableDataSource,
} from '../../../../../core/core.module';

@Injectable()
export class PhoneValidatorService implements ValidatorService {
    getRowValidator(): FormGroup {
        return new FormGroup({
            'Value': new FormControl(null, Validators.required),
            'Description': new FormControl(),
            'Type': new FormControl(),
        });
    }
}

@Component({
    selector: 'm-phones',
    templateUrl: './phones.component.html',
    styleUrls: ['./phones.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PhonesComponent),
            multi: true,
        },
        {
            provide: ValidatorService, useClass: PhoneValidatorService
        }
    ]
})
export class PhonesComponent implements OnInit, ControlValueAccessor {
    @Input() readonly: boolean = true;

    @Input() lang: string = "vi";

    private _onChangeCallback: (_: any) => void = () => { };

    private _obsers: any[] = [];

    displayedColumnsEdit = ['phone_number', 'description', 'type', 'action'];
    displayedColumns = ['phone_number', 'description', 'type'];
    selectedIndex: number = -1;

    phoneNumberType: any;

    phoneTypeArray: any;

    dataSource: TableDataSource<PhoneViewModel> = new TableDataSource<PhoneViewModel>([], PhoneViewModel, this._phoneValidator);

    phones: PhoneViewModel[] = [];

    constructor(
        private _commonUtil: CommonUtility,
        private _phoneTransformer: PhoneTransformer,
        private _phoneValidator: ValidatorService
    ) {
        this.phoneNumberType = PhoneType;
        this.phoneTypeArray = this._commonUtil.parseEnumToList(PhoneType);
    }

    ngOnInit() {
        this.bindSubscribes();
    }

    writeValue(obj: any): void {
        if (obj) {
            let phones = obj as PhoneModel[];

            this.phones = phones.map(x => this._phoneTransformer.toPhoneOverview(x));

            if (!this.readonly) {
                this.dataSource.datasourceSubject.next(phones.map(x => this._phoneTransformer.toPhoneOverview(x)));
            }
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    private bindSubscribes(): void {
        this._obsers.push(
            this.dataSource.datasourceSubject.subscribe(phoneList => {
                this.phones = phoneList;

                this._onChangeCallback(phoneList.map(x => this._phoneTransformer.toPhoneModel(x)));
            })
        );
    }
}