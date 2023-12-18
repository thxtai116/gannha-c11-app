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

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';

import { UnitsPage } from './units.page';
import { UnitsListPage } from './pages/units-list/units-list.page';
import { UnitsMapViewPage } from "./pages/units-map-view/units-map-view.page";
import { UnitsFormPage } from './pages/units-form/units-form.page';
import { UnitsDetailPage } from './pages/units-detail/units-detail.page';
import { UnitsOverviewPage } from './pages/units-overview/units-overview.page';
import { UnitsBasicInfoPage } from './pages/units-basic-info/units-basic-info.page';
import { UnitsLocationPage } from './pages/units-location/units-location.page';
import { UnitsReportPage } from './pages/units-report/units-report.page';

import { UnitsState, UnitsDetailState } from './states';

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
		MatRadioModule,

		TranslateModule.forChild(),

		RouterModule.forChild([
			{
				path: '',
				component: UnitsPage,
				children: [
					{
						path: "",
						component: UnitsListPage
					},
					{
						path: "map-view",
						component: UnitsMapViewPage,
					},
					{
						path: "create",
						component: UnitsFormPage,
					},
					{
						path: ":id",
						component: UnitsDetailPage,
						children: [
							{
								path: "",
								redirectTo: "basic-info"
								//component: UnitsOverviewPage,
							},
							{
								path: "basic-info",
								component: UnitsBasicInfoPage,
							},
							{
								path: "location",
								component: UnitsLocationPage,
							},
							{
								path: "report",
								component: UnitsReportPage,
							},
						]
					}
				]
			}
		])
	],
	providers: [
		UnitsState,
		UnitsDetailState,
	],
	declarations: [
		UnitsPage,
		UnitsListPage,
		UnitsMapViewPage,
		UnitsFormPage,
		UnitsDetailPage,
		UnitsOverviewPage,
		UnitsBasicInfoPage,
		UnitsLocationPage,
		UnitsReportPage,
	]
})
export class UnitsModule { }
