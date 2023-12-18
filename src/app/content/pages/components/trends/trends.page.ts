import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
	selector: 'm-trends',
	templateUrl: './trends.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendsPage implements OnInit {

	constructor(
	) {
	}

	ngOnInit(): void {
	}
}
