import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'm-actions-preview-sheet',
    templateUrl: 'actions-preview-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsPreviewSheetComponent implements OnInit{

    sellingPoints: FormControl = new FormControl();

    constructor(
        private _bottomSheetRef: MatBottomSheetRef<ActionsPreviewSheetComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    ) { }

    ngOnInit(): void {
        this.parseInjectionData(this.data);
    }

    private parseInjectionData(data: any) {
        this.sellingPoints.setValue(data.Actions.map(x => x.Service))
    }

    openLink(event: MouseEvent): void {
        this._bottomSheetRef.dismiss();
        event.preventDefault();
    }
}