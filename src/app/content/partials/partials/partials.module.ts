import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { QuickSidebarComponent } from './layout/quick-sidebar/quick-sidebar.component';
import { ScrollTopComponent } from './layout/scroll-top/scroll-top.component';
import { TooltipsComponent } from './layout/tooltips/tooltips.component';
import { ListSettingsComponent } from './layout/quick-sidebar/list-settings/list-settings.component';
import { NoticeComponent } from './content/general/notice/notice.component';
import { AlertComponent } from "./content/general/alert/alert.component";
import { ErrorParserComponent } from './content/general/error-parser/error-parser.component';
import { ObjectStatusBadgeComponent } from './content/general/object-status-badge/object-status-badge.component';
import { RawUnitStatusBadgeComponent } from './content/general/raw-unit-status-badge/raw-unit-status-badge.component';

import {
	MatInputModule,
	MatSortModule,
	MatProgressSpinnerModule,
	MatTableModule,
	MatPaginatorModule,
	MatSelectModule,
	MatProgressBarModule,
	MatButtonModule,
	MatCheckboxModule,
	MatIconModule,
	MatTooltipModule,
	MatChipsModule,
	MatFormFieldModule,
	MatAutocompleteModule,
	MatRadioModule,
	MatDividerModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
} from '@angular/material';

import { ReactiveFormsModule } from '@angular/forms';

import { MultiSelectModule } from './content/general/multi-select/multi-select.module';
import { CategoryListModule } from './content/general/category-list/category-list.module';
import { TagsModule } from './content/general/tags/tags.module';
import { SpinnerButtonModule } from './content/general/spinner-button/spinner-button.module';
import { SingleSelectModule } from "./content/general/single-select/single-select.module";
import { PortletModule } from './content/general/portlet/portlet.module';
import { BrandEmbryoModule } from './content/general/brand-embryo/brand-embryo.module';
import { SellingPointEmbryoModule } from './content/general/selling-point-embryo/selling-point-embryo.module';

import { CoreModule } from '../../../core/core.module';

import { JobEmbryoModule } from './content/general/job-embryo/job-embryo.module';

import { MessengerModule } from './layout/quick-sidebar/messenger/messenger.module';
import { ListTimelineModule } from './layout/quick-sidebar/list-timeline/list-timeline.module';

@NgModule({
	declarations: [
		QuickSidebarComponent,
		ScrollTopComponent,
		TooltipsComponent,
		ListSettingsComponent,
		NoticeComponent,
		AlertComponent,
		ObjectStatusBadgeComponent,
		RawUnitStatusBadgeComponent,
		ErrorParserComponent,
	],
	exports: [
		QuickSidebarComponent,
		ScrollTopComponent,
		TooltipsComponent,
		ListSettingsComponent,
		NoticeComponent,
		AlertComponent,
		ObjectStatusBadgeComponent,
		RawUnitStatusBadgeComponent,
		ErrorParserComponent,

		PortletModule,
		SpinnerButtonModule,
		MultiSelectModule,
		CategoryListModule,
		SingleSelectModule,
		TagsModule,
		BrandEmbryoModule,
		SellingPointEmbryoModule,
		JobEmbryoModule,
	],
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		FormsModule,
		PerfectScrollbarModule,
		MessengerModule,
		ListTimelineModule,
		CoreModule,
		PortletModule,
		SpinnerButtonModule,
		MatSortModule,
		MatInputModule,
		MatProgressSpinnerModule,
		MatTableModule,
		MatPaginatorModule,
		MatSelectModule,
		MatProgressBarModule,
		MatButtonModule,
		MatCheckboxModule,
		MatIconModule,
		MatTooltipModule,
		MatChipsModule,
		MatAutocompleteModule,
		MatFormFieldModule,
		MatRadioModule,
		MatDividerModule,
		MultiSelectModule,
		SingleSelectModule,
		TagsModule,
		BrandEmbryoModule,
		SellingPointEmbryoModule,
		JobEmbryoModule,

		TranslateModule.forChild()
	],
	providers: [
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'm-mat-dialog-container__wrapper',
				height: 'auto',
				width: 'auto'
			}
		},
	]
})
export class PartialsModule { }
