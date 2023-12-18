import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
	selector: 'm-collections',
	templateUrl: './collections.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsPage implements OnInit {

	constructor(
	) {
	}

	ngOnInit(): void {
	}
}
