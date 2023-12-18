import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
	selector: 'm-icons',
	templateUrl: './icons.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconsPage implements OnInit {

	constructor(
	) {
	}

	ngOnInit(): void {
	}
}
