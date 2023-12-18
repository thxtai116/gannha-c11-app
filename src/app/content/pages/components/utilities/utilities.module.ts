import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { UtilitiesComponent } from './utilities.component';

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

import { UtilitiesListPage } from './pages/utilities-list/utilities-list.page';
import { UtilitiesFormPage } from './pages/utilities-form/utilities-form.page';
import { UtilitiesDetailPage } from './pages/utilities-detail/utilities-detail.page';
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
				component: UtilitiesComponent,
				children: [
					{
						path: '',
						component: UtilitiesListPage,
					},
					{
						path: 'create',
						component: UtilitiesFormPage,
					},
					{
						path: ':id',
						component: UtilitiesDetailPage,
					}
				]
			}
		])
	],
	providers: [
	],
	declarations: [
		UtilitiesComponent,
		UtilitiesListPage,
		UtilitiesFormPage,
		UtilitiesDetailPage,
	]
})
export class UtilitiesModule { }
