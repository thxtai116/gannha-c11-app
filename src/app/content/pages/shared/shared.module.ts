import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core'

import { CoreModule } from '../../../core/core.module';
import { LayoutModule } from '../../layout/layout.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { PartialsModule } from '../../partials/partials/partials.module';
import { NgxMatDrpModule } from 'ngx-mat-daterange-picker';

import {
	UnitsSelectorComponent,
	BrandsSelectorComponent,
	CategoriesSelectorComponent,
	UtilitiesCarouselComponent,
	UtilitiesSelectorComponent,
	IconsCarouselComponent,
	IconsSelectorComponent,
	PlacesSelectorComponent,
	AdministrationSelectorComponent,
	AddressContactComponent,
	CountriesSelectorComponent,
	ProvincesSelectorComponent,
	DistrictsSelectorComponent,
	WardsSelectorComponent,
	ScheduleRepeatComponent,
	ScheduleRepeatDailyComponent,
	ScheduleRepeatWeeklyComponent,
	DayOfWeekComponent,
	LocationFormComponent,
	MapViewComponent,
	AdvancedCategoriesComponent,
	UnitQuickCreateComponent,
	SelectionPreviewComponent,
	OrderNotesListComponent,
	BoardComponent,
	OrderNoteFormComponent,
	UnitsLocationsOverview,
	AddressParserBottomSheetComponent,
	SellingPointTimelineComponent,
	UnitsListPrototypeComponent,
	ImagesPreviewSliderComponent,
	MapMarkersComponent,
} from './components';

import {
	MatButtonModule,
	MatInputModule,
	MatSelectModule,
	MatPaginatorModule,
	MatTableModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatFormFieldModule,
	MatCheckboxModule,
	MatIconModule,
	MatGridListModule,
	MatMenuModule,
	MatTooltipModule,
	MatChipsModule,
	MatDialogModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
	MatRadioModule,
	MatTreeModule,
	MatDatepickerModule,
	MatNativeDateModule,
	MatExpansionModule,
	MatDividerModule,
	MatBottomSheetModule,
	MatTabsModule,
} from "@angular/material";

import { NgDragDropModule } from 'ng-drag-drop';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TranslateModule } from '@ngx-translate/core';

import { PhonesModule } from './modules/phones/phones.module';
import { TimeModule } from './modules/time/components/time.module';
import { RecommendationComposerModule } from './modules/recommendation-composer/recommendation-composer.module';
import { SingleSellingPointSelectorModule } from './modules/single-selling-point-selector/single-selling-point-selector.module';
import { SellingPointServiceModule } from './modules/selling-point-service/selling-point-service.module';

import { SellingPointTimeRangesComponent } from './components/selling-point-time-ranges/selling-point-time-ranges.component';
import { UnitsListComponent } from './components/units-list/units-list.component';
import { SingleBrandSelectorModule } from './modules/single-brand-selector/single-brand-selector.module';
import { SingleCollectionSelectorModule } from './modules/single-collection-selector/single-collection-selector.module';
import { SingleCategorySelectorModule } from './modules/single-category-selector/single-category-selector.module';
import { DateRangePickerModule } from './modules/data-range-picker/date-range-picker.module';
import { ChartsModule } from './modules/charts/charts.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DateRangePickerPrototypeModule } from './modules/date-range-picker-prototype/date-range-picker-prototype.module';
import { environment as env } from '../../../../environments/environment';

@NgModule({
	declarations: [
		BrandsSelectorComponent,
		UnitsSelectorComponent,
		CategoriesSelectorComponent,
		UtilitiesCarouselComponent,
		UtilitiesSelectorComponent,
		PlacesSelectorComponent,
		IconsCarouselComponent,
		IconsSelectorComponent,
		AdministrationSelectorComponent,
		AddressContactComponent,
		CountriesSelectorComponent,
		ProvincesSelectorComponent,
		DistrictsSelectorComponent,
		WardsSelectorComponent,
		ScheduleRepeatComponent,
		ScheduleRepeatDailyComponent,
		ScheduleRepeatWeeklyComponent,
		DayOfWeekComponent,
		LocationFormComponent,
		MapViewComponent,
		AdvancedCategoriesComponent,
		SellingPointTimeRangesComponent,
		UnitsListComponent,
		UnitsListPrototypeComponent,
		UnitQuickCreateComponent,
		AddressParserBottomSheetComponent,
		SelectionPreviewComponent,
		OrderNotesListComponent,
		OrderNoteFormComponent,
		BoardComponent,
		UnitsLocationsOverview,
		SellingPointTimelineComponent,
		ImagesPreviewSliderComponent,
		MapMarkersComponent,
	],
	entryComponents: [
		BrandsSelectorComponent,
		UnitsSelectorComponent,
		CategoriesSelectorComponent,
		UtilitiesSelectorComponent,
		PlacesSelectorComponent,
		IconsSelectorComponent,
		ScheduleRepeatDailyComponent,
		ScheduleRepeatWeeklyComponent,
		UnitQuickCreateComponent,
		AddressParserBottomSheetComponent,
		OrderNoteFormComponent,
		SelectionPreviewComponent,
		SellingPointTimelineComponent,
		ImagesPreviewSliderComponent,
	],
	exports: [
		UtilitiesCarouselComponent,
		AdministrationSelectorComponent,
		AddressContactComponent,
		CountriesSelectorComponent,
		ProvincesSelectorComponent,
		DistrictsSelectorComponent,
		WardsSelectorComponent,
		ScheduleRepeatComponent,
		DayOfWeekComponent,
		LocationFormComponent,
		MapViewComponent,
		AdvancedCategoriesComponent,
		IconsCarouselComponent,
		PhonesModule,
		SellingPointTimeRangesComponent,
		TimeModule,
		ChartsModule,
		UnitsListComponent,
		UnitsListPrototypeComponent,
		SellingPointServiceModule,
		RecommendationComposerModule,
		DateRangePickerModule,
		DateRangePickerPrototypeModule,
		BoardComponent,
		OrderNotesListComponent,
		UnitsLocationsOverview,
		SellingPointTimelineComponent,
		MapMarkersComponent,
	],
	imports: [
		CommonModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		CoreModule,
		NgDragDropModule,
		NgxChartsModule,
		MatFormFieldModule,
		MatButtonModule,
		MatInputModule,
		MatSelectModule,
		MatPaginatorModule,
		MatTableModule,
		MatProgressSpinnerModule,
		MatSortModule,
		MatCheckboxModule,
		MatGridListModule,
		MatIconModule,
		MatMenuModule,
		MatTooltipModule,
		MatChipsModule,
		MatDialogModule,
		MatRadioModule,
		MatTreeModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatExpansionModule,
		MatDividerModule,
		MatBottomSheetModule,
		MatTabsModule,

		ImageCropperModule,

		PhonesModule,
		LayoutModule,
		PartialsModule,
		NgxMatDrpModule,
		NgxMaterialTimepickerModule,

		TranslateModule.forChild(),
		AgmCoreModule.forRoot({ apiKey: env.googleKey }),
		RecommendationComposerModule,
		SingleSellingPointSelectorModule,
		SingleBrandSelectorModule,
		SingleCollectionSelectorModule,
		SingleCategorySelectorModule,
		DateRangePickerModule,
		DateRangePickerPrototypeModule,
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
		}
	]
})

export class SharedModule {
}

export * from "./components/index";