import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

import { CollectionsPage } from './collections.page';

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
	MatExpansionModule
} from "@angular/material";

import { CollectionsListPage } from './pages/collections-list/collections-list.page';
import { CollectionsFormPage } from './pages/collections-form/collections-form.page';
import { CollectionsDetailPage } from './pages/collections-detail/collections-detail.page';
import { CollectionsBasicInfoPage } from './pages/collections-basic-info/collections-basic-info.page';
import { CollectionsResourcesPage } from './pages/collections-resources/collections-resources.page';

import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';

import { CollectionsState, CollectionsDetailState } from './states';

import { MenuService } from './services';

import { FilesModule } from '../../../partials/smarts/files/files.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,

		CoreModule,
		LayoutModule,
		PartialsModule,
		SharedModule,
		FilesModule,

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
				component: CollectionsPage,
				children: [
					{
						path: '',
						component: CollectionsListPage
					},
					{
						path: 'create',
						component: CollectionsFormPage
					},
					{
						path: "create/:id",
						component: CollectionsFormPage
					},
					{
						path: ':id',
						component: CollectionsDetailPage,
						children: [
							{
								path: '',
								redirectTo: 'basic-info'
							},
							{
								path: 'basic-info',
								component: CollectionsBasicInfoPage
							},
							{
								path: 'resources',
								component: CollectionsResourcesPage
							}
						]
					}
				]
			}
		])
	],
	providers: [
		CollectionsState,
		CollectionsDetailState,

		MenuService
	],
	declarations: [
		CollectionsPage,
		CollectionsListPage,
		CollectionsFormPage,
		CollectionsDetailPage,
		CollectionsBasicInfoPage,
		CollectionsResourcesPage
	]
})
export class CollectionsModule { }
