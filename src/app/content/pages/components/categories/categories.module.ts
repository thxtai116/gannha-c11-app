import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { CategoriesPage } from './categories.page';

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
} from "@angular/material";

import { CategoriesListPage } from './pages/categories-list/categories-list.page';
import { CategoriesFormPage } from './pages/categories-form/categories-form.page';
import { CategoriesDetailPage } from './pages/categories-detail/categories-detail.page';

import { TranslateModule } from '@ngx-translate/core';

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

		NgxMatSelectSearchModule,

		TranslateModule.forChild(),

		RouterModule.forChild([
			{
				path: '',
				component: CategoriesPage,
				children: [
					{
						path: '',
						component: CategoriesListPage,
					},
					{
						path: 'create',
						component: CategoriesFormPage,
					},
					{
						path: ':id',
						component: CategoriesDetailPage,
					}
				]
			}
		])
	],
	providers: [
	],
	declarations: [
		CategoriesPage,
		CategoriesListPage,
		CategoriesFormPage,
		CategoriesDetailPage,
	]
})
export class CategoriesModule { }
