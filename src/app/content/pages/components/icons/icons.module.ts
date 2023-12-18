import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';

import { NgxMatSelectSearchModule } from "ngx-mat-select-search";

import { IconsPage } from './icons.page';
import { IconsListPage } from './pages/icons-list/icons-list.page';

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
				component: IconsPage,
				children: [
					{
						path: '',
						component: IconsListPage,
					}
				]
			}
		])
	],
	providers: [
	],
	declarations: [
		IconsPage,
		IconsListPage,
	]
})
export class IconsModule { }
