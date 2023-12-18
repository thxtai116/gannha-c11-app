import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from '../../shared/shared.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

import { SellingPointTypesPage } from "./selling-point-types.page";
import { SellingPointTypesListPage } from "./pages/selling-point-types-list/selling-point-types-list.page";
import { SellingPointTypesFormPage } from './pages/selling-point-types-form/selling-point-types-form.page';
import { SellingPointTypesDetailPage } from "./pages/selling-point-types-detail/selling-point-types-detail.page";

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
				component: SellingPointTypesPage,
				children: [
					{
						path: '',
						component: SellingPointTypesListPage,
					},
					{
						path: 'create',
						component: SellingPointTypesFormPage,
					},
					{
						path: ':id',
						component: SellingPointTypesDetailPage,
					}
				]
			}
		])
	],
	providers: [
	],
	declarations: [
		SellingPointTypesPage,
		SellingPointTypesListPage,
		SellingPointTypesFormPage,
		SellingPointTypesDetailPage,
	]
})
export class SellingPointTypesModule { }
