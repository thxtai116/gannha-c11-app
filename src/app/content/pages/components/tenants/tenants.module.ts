import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

import { TenantsPage } from './tenants.page';
import { TenantsListPage } from './pages/tenants-list/tenants-list.page';
import { TenantsFormPage } from './pages/tenants-form/tenants-form.page';
import { TenantsDetailPage } from './pages/tenants-detail/tenants-detail.page';

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

import { TenantsState } from './states';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,

		CoreModule,
		LayoutModule,
		PartialsModule,

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
				component: TenantsPage,
				children: [
					{
						path: '',
						component: TenantsListPage
					},
					{
						path: 'create',
						component: TenantsFormPage
					},
					{
						path: ':id',
						component: TenantsDetailPage
					}
				]
			}
		])
	],
	providers: [
		TenantsState
	],
	declarations: [
		TenantsPage,
		TenantsListPage,
		TenantsFormPage,
		TenantsDetailPage
	]
})
export class TenantsModule { }
