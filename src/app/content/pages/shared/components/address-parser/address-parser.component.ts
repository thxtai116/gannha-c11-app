import { ChangeDetectionStrategy, OnInit, Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

@Component({
    selector: 'm-address-parser',
    templateUrl: 'address-parser.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressParserBottomSheetComponent implements OnInit {

    ParseAddress: FormControl = new FormControl('');

    constructor(
        private _bottomSheetRef: MatBottomSheetRef<AddressParserBottomSheetComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) private _data: any
    ) { }

    ngOnInit(): void {
        this.parseInjectionData(this._data);
    }

    private parseInjectionData(data: any) {
        if (data.address && data.address.length > 0) {
            this.ParseAddress.setValue(data.address);
        }
    }

    confirmAddress() {
        let address = this.ParseAddress.value;

        this._bottomSheetRef.dismiss({
            address: address
        })
    }
}