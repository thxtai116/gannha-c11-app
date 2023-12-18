import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
	selector: 'm-recommendations',
	templateUrl: './recommendations.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsPage implements OnInit {

	constructor(
	) {
	}

	ngOnInit(): void {
	}
}
