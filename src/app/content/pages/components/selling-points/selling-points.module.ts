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
	MatBottomSheetModule,
} from "@angular/material";

import { TranslateModule } from '@ngx-translate/core';

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';
import { FilesModule } from '../../../partials/smarts/files/files.module';

import { SellingPointsPage } from './selling-points.page';
import { SellingPointsListPage } from "./pages/selling-points-list/selling-points-list.page";

import { SellingPointsFormPage } from './pages/selling-points-form/selling-points-form.page';
import { SellingPointsDetailPage } from './pages/selling-points-detail/selling-points-detail.page';
import { SellingPointsBasicInfoPage } from './pages/selling-points-basic-info/selling-points-basic-info.page';

import { SellingPointsState, SellingPointsDetailState } from './states';

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
		MatBottomSheetModule,

		TranslateModule.forChild(),
		RouterModule.forChild([
			{
				path: '',
				component: SellingPointsPage,
				children: [
					{
						path: "",
						component: SellingPointsListPage
					},
					{
						path: "create",
						component: SellingPointsFormPage
					},
					{
						path: "create/:id",
						component: SellingPointsFormPage
					},
					{
						path: ":id",
						component: SellingPointsDetailPage,
						children: [
							{
								path: "",
								redirectTo: "basic-info"
							},
							{
								path: "basic-info",
								component: SellingPointsBasicInfoPage
							}
						]
					}
				]
			}
		])
	],
	providers: [
		SellingPointsState,
		SellingPointsDetailState
	],
	declarations: [
		SellingPointsPage,
		SellingPointsListPage,
		SellingPointsFormPage,
		SellingPointsDetailPage,
		SellingPointsBasicInfoPage,
	]
})
export class SellingPointsModule { }
