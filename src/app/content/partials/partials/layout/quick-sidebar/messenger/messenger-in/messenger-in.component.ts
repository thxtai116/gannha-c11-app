import { Component, OnInit, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'm-messenger-in',
	templateUrl: './messenger-in.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessengerInComponent implements OnInit {
	@HostBinding('class') classes = 'm-messenger__wrapper';
	@Input() message: any;

	constructor() {}

	ngOnInit(): void {}
}
