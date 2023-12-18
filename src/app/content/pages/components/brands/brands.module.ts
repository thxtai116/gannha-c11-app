import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

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
	MatRadioModule,
} from "@angular/material";

import { TranslateModule } from '@ngx-translate/core';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';
import { FilesModule } from '../../../partials/smarts/files/files.module';

import { BrandsPage } from './brands.page';

import { BrandsDetailPage } from "./pages/brands-detail/brands-detail.page";
import { BrandsFormPage } from "./pages/brands-form/brands-form.page";
import { BrandsListPage } from "./pages/brands-list/brands-list.page";

import { BrandsBasicInfoPage } from "./pages/brands-basic-info/brands-basic-info.page";
import { BrandsDefaultSellingPointPage } from './pages/brands-default-selling-point/brands-default-selling-point.page';

import {
	BrandsState,
	BrandsDetailState,
} from "./states/index";

import { MenuService } from './services/index';

import { BrandsManagersPage } from './pages/brands-managers/brands-managers.page';
import { SupervisorAssignmentComponent } from './components/supervisor-assignment/supervisor-assignment.component';
import { BrandManagersComponent } from './components/brand-managers/brand-managers.component';

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
		MatRadioModule,

		NgxMatSelectSearchModule,

		TranslateModule.forChild(),

		RouterModule.forChild([
			{
				path: '',
				component: BrandsPage,
				children: [
					{
						path: '',
						component: BrandsListPage,
					},
					{
						path: 'create',
						component: BrandsFormPage,
					},
					{
						path: ':id',
						component: BrandsDetailPage,
						children: [
							{
								path: '',
								redirectTo: 'basic-info'
							},
							{
								path: 'basic-info',
								component: BrandsBasicInfoPage
							},
							{
								path: 'default-selling-point',
								component: BrandsDefaultSellingPointPage
							},
							{
								path: 'managers',
								component: BrandsManagersPage
							}
						]
					}
				]
			}
		])
	],
	providers: [
		BrandsState,
		BrandsDetailState,
		MenuService
	],
	declarations: [
		BrandsPage,
		BrandsListPage,
		BrandsFormPage,
		BrandsDetailPage,

		BrandsBasicInfoPage,
		BrandsDefaultSellingPointPage,
		BrandsManagersPage,

		SupervisorAssignmentComponent,

		BrandManagersComponent,
	],
	entryComponents: [
		SupervisorAssignmentComponent,
		BrandManagersComponent
	]
})
export class BrandsModule { }
