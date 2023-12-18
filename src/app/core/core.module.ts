import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApplicationInsightsModule, AppInsightsService } from "@markpieszak/ng-application-insights";

import {
	MenuAsideDirective,
	MenuAsideOffcanvasDirective,
	MenuHorizontalOffcanvasDirective,
	MenuHorizontalDirective,
	ClipboardDirective,
	ScrollTopDirective,
	HeaderDirective,
	MenuAsideToggleDirective,
	QuickSidebarOffcanvasDirective,
	TabLineDirective,
	QuickSearchDirective,
	PortletDirective,
	AutosizeDirective,
	ImagePreloadDirective,
	PhoneNumberDirective,
} from './directives/index';

import {
	FirstLetterPipe,
	TimeElapsedPipe,
	JoinPipe,
	GetObjectPipe,
	ConsoleLogPipe,
	SafePipe,
	LanguagePipe,
	SecondsToDatePipe,
	ShortTimePipe,
	SanitizeHtmlPipe,
	WordsCounterPipe,
	GenderNamePipe,
	DegreeNamePipe,
	TimeRangeToTextPipe,
	DateRangePipe,
	PropertyInListPipe,
	MomentToDatePipe,
} from './pipes/index';

import {
	AppInsightsUtility,
	LanguageUtility,
	CategoryUtility,
	CommonUtility,
	DateTimeUtility,
	ScheduleUtility,
	ShiftsUtility,
	ImageUtility,
	StorageUtility,
	HttpUtility,
	GoogleMapsApiUtility,
	AppStatusUtility,
	UuidUtility
} from './utilities/index';

import { HttpModule } from '@angular/http';

import {
	UnitTransformer,
	SellingPointTransformer,
	CollectionTransformer,
	RecommendationTransformer,
	TrendTransformer,
	TenantTransformer,
	OpenServiceTransformer,
	PhoneTransformer,
	UserTransformer,
	BrandTransformer,
	UtilityTransformer,
	CategoryTransformer,
	IconTransformer,
	PlaceTransformer,
	SellingPointTypeTransformer,
	JobTransformer,
	SubmissionTransformer,
	RawUnitTransformer,
	FacebookPostTransformer,
	NotificationCampaignTransformer,
	RecruitmentTransformer,
	OrderTransformer,
	DiscountTransformer,
} from './transformers';

import {
	MatDialogModule,
	MatSnackBarModule,
	MatButtonModule,
	MatIconModule,
	MAT_DIALOG_DEFAULT_OPTIONS
} from '@angular/material';

import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { ConfirmDialogComponent, SystemAlertComponent, OrderStatusBadgeComponent } from './components';
import { TaxNumberDirective } from './directives/tax-number.directive';

@NgModule({
	imports: [
		CommonModule,
		ApplicationInsightsModule,
		HttpModule,

		MatDialogModule,
		MatSnackBarModule,
		MatButtonModule,
		MatIconModule,

		TranslateModule.forChild(),
	],
	declarations: [
		// directives
		MenuAsideDirective,
		MenuAsideOffcanvasDirective,
		MenuHorizontalOffcanvasDirective,
		MenuHorizontalDirective,
		ScrollTopDirective,
		HeaderDirective,
		MenuAsideToggleDirective,
		QuickSidebarOffcanvasDirective,
		QuickSearchDirective,
		ClipboardDirective,
		TabLineDirective,
		PortletDirective,
		AutosizeDirective,
		ImagePreloadDirective,
		PhoneNumberDirective,
		TaxNumberDirective,
		// pipes
		FirstLetterPipe,
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		ConsoleLogPipe,
		SafePipe,
		LanguagePipe,
		SecondsToDatePipe,
		SanitizeHtmlPipe,
		ShortTimePipe,
		WordsCounterPipe,
		GenderNamePipe,
		DegreeNamePipe,
		TimeRangeToTextPipe,
		DateRangePipe,
		PropertyInListPipe,
		MomentToDatePipe,
		// components
		ConfirmDialogComponent,
		SystemAlertComponent,
		OrderStatusBadgeComponent,
	],
	entryComponents: [
		ConfirmDialogComponent,
		SystemAlertComponent,
	],
	exports: [
		// directives
		MenuAsideDirective,
		MenuAsideOffcanvasDirective,
		MenuHorizontalOffcanvasDirective,
		MenuHorizontalDirective,
		ScrollTopDirective,
		HeaderDirective,
		MenuAsideToggleDirective,
		QuickSidebarOffcanvasDirective,
		QuickSearchDirective,
		ClipboardDirective,
		TabLineDirective,
		PortletDirective,
		AutosizeDirective,
		ImagePreloadDirective,
		PhoneNumberDirective,
		TaxNumberDirective,
		// pipes
		FirstLetterPipe,
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		ConsoleLogPipe,
		SafePipe,
		LanguagePipe,
		SecondsToDatePipe,
		ShortTimePipe,
		TimeRangeToTextPipe,
		SanitizeHtmlPipe,
		WordsCounterPipe,
		GenderNamePipe,
		DegreeNamePipe,
		DateRangePipe,
		PropertyInListPipe,
		MomentToDatePipe,

		OrderStatusBadgeComponent,
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
		// pipes
		DatePipe,
		// utilities
		AppInsightsUtility,
		LanguageUtility,
		CategoryUtility,
		CommonUtility,
		DateTimeUtility,
		ScheduleUtility,
		ShiftsUtility,
		ImageUtility,
		StorageUtility,
		HttpUtility,
		UuidUtility,
		GoogleMapsApiUtility,
		AppStatusUtility,
		// services
		AppInsightsService,
		TranslateService,

		// transformer
		BrandTransformer,
		CategoryTransformer,
		UnitTransformer,
		SellingPointTransformer,
		CollectionTransformer,
		RecommendationTransformer,
		TrendTransformer,
		TenantTransformer,
		OpenServiceTransformer,
		PhoneTransformer,
		UserTransformer,
		UtilityTransformer,
		IconTransformer,
		PlaceTransformer,
		SellingPointTypeTransformer,
		JobTransformer,
		SubmissionTransformer,
		RawUnitTransformer,
		FacebookPostTransformer,
		NotificationCampaignTransformer,
		OrderTransformer,
		DiscountTransformer,
		RecruitmentTransformer,
	]
})
export class CoreModule { }

export * from "./directives/index";

export * from "./pipes/index";

export * from "./types/index";

export * from "./models/index";

export * from "./handlers/index";

export * from "./utilities/index";

export * from "./consts/index";

export * from "./enums/index";

export * from "./custom-validators/index";

export * from "./services/index";

export * from "./interfaces/index";

export * from "./states/index";

export * from "./datasources/index";

export * from "./view-models/index";

export * from "./transformers/index";

export * from "./misc/index";

export * from "./forms/index";