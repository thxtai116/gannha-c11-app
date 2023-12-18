import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'confirm-entity-dialog',
	templateUrl: './confirm-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent implements OnInit {
	viewLoading: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<ConfirmDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onYesClick(): void {
		this.dialogRef.close(true);
	}
}
