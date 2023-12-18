import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
	selector: 'm-categories',
	templateUrl: './categories.page.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesPage implements OnInit {

	constructor(
	) {
	}

	ngOnInit(): void {
	}
}
