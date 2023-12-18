import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';

import {
	MatButtonModule,
	MatInputModule,
	MatSelectModule,
	MatPaginatorModule,
	MatTableModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatCheckboxModule,
	MatIconModule,
	MatMenuModule,
	MatTooltipModule,
	MatChipsModule
} from "@angular/material";

import { TranslateModule } from '@ngx-translate/core';

import { TrendsPage } from './trends.page';
import { TrendsListPage } from './pages/trends-list/trends-list.page';
import { TrendsFormPage } from './pages/trends-form/trends-form.page';
import { TrendsDetailPage } from './pages/trends-detail/trends-detail.page';
import { TrendsBasicInfoPage } from './pages/trends-basic-info/trends-basic-info.page';
import { TrendsResourcesPage } from './pages/trends-resources/trends-resources.page';

import { TrendsDetailState } from './states';

import { MenuService } from './services';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,

		CoreModule,
		LayoutModule,
		PartialsModule,
		SharedModule,

		MatButtonModule,
		MatInputModule,
		MatSelectModule,
		MatPaginatorModule,
		MatTableModule,
		MatProgressSpinnerModule,
		MatSortModule,
		MatCheckboxModule,
		MatIconModule,
		MatMenuModule,
		MatTooltipModule,
		MatChipsModule,

		TranslateModule.forChild(),

		RouterModule.forChild([
			{
				path: '',
				component: TrendsPage,
				children: [
					{
						path: '',
						component: TrendsListPage
					},
					{
						path: 'create',
						component: TrendsFormPage
					},
					{
						path: ':id',
						component: TrendsDetailPage,
						children: [
							{
								path: '',
								redirectTo: 'basic-info'
							},
							{
								path: 'basic-info',
								component: TrendsBasicInfoPage
							},
							{
								path: 'resources',
								component: TrendsResourcesPage
							}
						]
					}
				]
			}
		])
	],
	providers: [
		MenuService,

		TrendsDetailState
	],
	declarations: [
		TrendsPage,
		TrendsListPage,
		TrendsFormPage,
		TrendsDetailPage,
		TrendsBasicInfoPage,
		TrendsResourcesPage
	]
})

export class TrendsModule { }