import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
	selector: 'm-utilities',
	templateUrl: './utilities.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UtilitiesComponent implements OnInit {

	constructor(
	) {
	}

	ngOnInit(): void {
	}
}
