import {
	Component,
	OnInit,
	HostBinding,
	Input,
	ChangeDetectionStrategy
} from '@angular/core';

import { LayoutConfigService } from '../../../../core/core.module';

import * as objectPath from 'object-path';

@Component({
	selector: 'm-topbar',
	templateUrl: './topbar.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopbarComponent implements OnInit {
	@HostBinding('id') id = 'm_header_nav';
	@HostBinding('class')
	classes = 'm-stack__item m-stack__item--fluid m-header-head';

	@Input() searchType: any;

	constructor(
		private layoutConfigService: LayoutConfigService
	) {
		this.layoutConfigService.onLayoutConfigUpdated$.subscribe(model => {
			const config = model.config;
			this.searchType = objectPath.get(config, 'header.search.type');
		});
	}

	ngOnInit(): void { }
}
