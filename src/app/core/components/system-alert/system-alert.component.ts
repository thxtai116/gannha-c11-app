import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material';

@Component({
	selector: 'm-system-alert',
	templateUrl: './system-alert.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush

})
export class SystemAlertComponent implements OnInit {
	constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

	ngOnInit() {
	}

	onDismiss() { this.data.snackBar.dismiss(); }
}
