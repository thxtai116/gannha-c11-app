import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

import { RecommendationsPage } from './recommendations.page';
import { RecommendationsListPage } from './pages/recommendations-list/recommendations-list.page';
import { RecommendationsFormPage } from './pages/recommendations-form/recommendations-form.page';
import { RecommendationsDetailPage } from './pages/recommendations-detail/recommendations-detail.page';
import { RecommendationsBasicInfoPage } from './pages/recommendations-basic-info/recommendations-basic-info.page';
import { RecommendationsResourcesPage } from './pages/recommendations-resources/recommendations-resources.page';

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
	MatChipsModule,
	MatExpansionModule,
} from "@angular/material";

import { TranslateModule } from '@ngx-translate/core';

import { MenuService } from './services';
import { RecommendationsDetailState } from './states';

import { SharedModule } from '../../shared/shared.module';

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
		MatExpansionModule,

		TranslateModule.forChild(),

		RouterModule.forChild([
			{
				path: '',
				component: RecommendationsPage,
				children: [
					{
						path: '',
						component: RecommendationsListPage
					},
					{
						path: 'create',
						component: RecommendationsFormPage
					},
					{
						path: ':id',
						component: RecommendationsDetailPage,
						children: [
							{
								path: '',
								redirectTo: 'basic-info'
							},
							{
								path: 'basic-info',
								component: RecommendationsBasicInfoPage
							},
							{
								path: 'resources',
								component: RecommendationsResourcesPage
							}
						]
					}
				]
			}
		])
	],
	providers: [
		MenuService,

		RecommendationsDetailState
	],
	declarations: [
		RecommendationsPage,
		RecommendationsListPage,
		RecommendationsFormPage,
		RecommendationsDetailPage,
		RecommendationsBasicInfoPage,
		RecommendationsResourcesPage
	]
})
export class RecommendationsModule { }
