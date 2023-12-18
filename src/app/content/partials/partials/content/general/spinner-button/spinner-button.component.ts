import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { SpinnerButtonOptionModels } from './button-options.interface';

@Component({
	selector: 'm-spinner-button',
	templateUrl: './spinner-button.component.html',
	styleUrls: ['./spinner-button.component.scss'],
})
export class SpinnerButtonComponent implements OnInit {
	@Input() options: SpinnerButtonOptionModels;

	constructor() {}

	ngOnInit() {}
}
