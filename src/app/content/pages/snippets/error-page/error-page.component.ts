import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
	selector: 'm-error-page',
	templateUrl: './error-page.component.html',
	styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {

	@HostBinding('class') classes: string = 'm-grid m-grid--hor m-grid--root m-page';

	@Input() errorType: number;

	constructor() {
	}

	ngOnInit() {
	}
}
