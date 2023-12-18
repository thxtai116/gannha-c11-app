import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'm-selection-preview',
    templateUrl: 'selection-preview.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionPreviewComponent implements OnInit {

    _data: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<SelectionPreviewComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        this.parseInjectionData(this.data);
    }

    private parseInjectionData(data: any) {
        for (let item of data.selectedItems) {
            this._data.push(item);
        }
    }

    onClose() {
        this.dialogRef.close();
    }
}