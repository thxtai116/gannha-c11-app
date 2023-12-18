import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LayoutModule } from './content/layout/layout.module';
import { PartialsModule } from './content/partials/partials/partials.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { PerfectScrollbarConfigInterface, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { ApplicationInsightsModule, AppInsightsService } from "@markpieszak/ng-application-insights";
import { GestureConfig, MatProgressSpinnerModule } from '@angular/material';
import { OverlayModule } from '@angular/cdk/overlay';
import { OAuthModule } from "angular-oauth2-oidc";
import { NgDragDropModule } from "ng-drag-drop";
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { environment as env } from "../environments/environment";
import { EmbedVideo } from 'ngx-embed-video';

import {
	GlobalState,

	UserService,
	TenantService,
	AuthService,
	AreaService,
	AssignService,
	CategoryService,
	BrandService,
	UtilityService,
	SellingPointTypeService,
	CollectionService,
	RecommendationService,
	SystemAlertService,
	ConfirmService,
	UnitService,
	ReportService,
	SellingPointService,
	OpenService,
	IconService,
	PlaceService,
	ResourceService,
	TrendService,
	JobBenefitService,
	JobTypeService,
	JobService,
	RecruitmentService,
	SubmissionService,
	OrderService,

	SplashScreenService,
	MenuHorizontalService,
	HeaderService,
	LayoutRefService,
	SubheaderService,
	LayoutConfigStorageService,
	ClipboardService,
	ClassInitService,
	UtilsService,
	PageConfigService,
	MenuConfigService,
	LayoutConfigService,
	AclService,

	CoreModule,
	GNErrorHandler,
	FilterStorageService,
	RawUnitService,
	CatalogService,
	FacebookPageService,
	NotificationService,
	CommerceCategoryService,
	CommerceProductService,
	ExcelService,
	PDFService,
	DiscountService,
	PromotionCodeCampaignService,
	RecruiterService,
	VerificationRequestService,
	OneSignalService,
	ExplorerService,
	FolderService,

	RecruitmentsDataSource,
	RecruitmentSubmissionsDataSource,
	RecruitmentInterviewsDataSource,
	RecruitmentJobsDataSource,
	JobSubmissionsDataSource,
	RecruitersDataSource,

	JobTitleService,
} from './core/core.module';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	// suppressScrollX: true
};

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserAnimationsModule,
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		LayoutModule,
		PartialsModule,
		NgxChartsModule,
		CoreModule,
		OverlayModule,
		TranslateModule.forRoot(),
		MatProgressSpinnerModule,
		ApplicationInsightsModule.forRoot({
			instrumentationKey: env.applicationInsights.instrumentationKey
		}),
		OAuthModule.forRoot(),
		NgDragDropModule.forRoot(),
		NgxMaterialTimepickerModule,
		HttpClientModule,
		EmbedVideo.forRoot(),
	],
	providers: [
		AclService,
		LayoutConfigService,
		LayoutConfigStorageService,
		LayoutRefService,
		MenuConfigService,
		PageConfigService,
		UtilsService,
		ClassInitService,
		ClipboardService,
		SplashScreenService,
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
		},

		// template services
		SubheaderService,
		HeaderService,
		MenuHorizontalService,
		SystemAlertService,
		ConfirmService,
		ExcelService,
		PDFService,
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: GestureConfig
		},
		{ provide: ErrorHandler, useClass: GNErrorHandler },
		AppInsightsService,
		// Business
		AreaService,
		AssignService,
		AuthService,
		TenantService,
		UserService,
		CategoryService,
		CatalogService,
		BrandService,
		ResourceService,
		UtilityService,
		SellingPointTypeService,
		CollectionService,
		RecommendationService,
		TrendService,
		UnitService,
		SellingPointService,
		OpenService,
		IconService,
		PlaceService,
		FilterStorageService,
		JobBenefitService,
		JobTypeService,
		JobService,
		RecruitmentService,
		SubmissionService,
		RawUnitService,
		ReportService,
		FacebookPageService,
		NotificationService,
		OrderService,
		CommerceCategoryService,
		CommerceProductService,
		DiscountService,
		RecruiterService,
		VerificationRequestService,
		OneSignalService,

		// Recruiments

		JobTitleService,

		// Promodetion Code Service
		PromotionCodeCampaignService,

		// Gallery
		FolderService,
		ExplorerService,

		// State
		GlobalState,

		// Datasource

		RecruitmentsDataSource,
		RecruitmentSubmissionsDataSource,
		RecruitmentInterviewsDataSource,
		RecruitmentJobsDataSource,
		JobSubmissionsDataSource,
		RecruitersDataSource,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
