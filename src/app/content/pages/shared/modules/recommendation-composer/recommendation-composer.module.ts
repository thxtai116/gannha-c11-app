import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MAT_DIALOG_DEFAULT_OPTIONS,
    MatDialogModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSortModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatDatepickerModule
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { CoreModule } from '../../../../../core/core.module';
import { PartialsModule } from '../../../../partials/partials/partials.module';
import { DateRangePickerModule } from '../data-range-picker/date-range-picker.module';

import { CollectionsComposerContainerComponent } from './components/collections-composer-container/collections-composer-container.component';
import { CollectionsSliderComponent } from './components/collections-slider/collections-slider.component';

import { CollectionComposerComponent } from './entryComponents/collection-composer/collection-composer.component';
import { CategoryComposerComponent } from './entryComponents/category-composer/category-composer.component';
import { RecommendationComposerComponent } from './entryComponents/recommendation-composer/recommendation-composer.component';

import { SellingPointsSelectorComponent } from './entryComponents/selling-points-selector/selling-points-selector.component';
import { CollectionsSelectorComponent } from './entryComponents/collections-selector/collections-selector.component';
import { CategoriesSelectorComponent } from './entryComponents/categories-selector/categories-selector.component';
import { BrandsSelectorComponent } from './entryComponents/brands-selector/brands-selector.component';
import { SingleBrandSellingPointsSelectorComponent } from './entryComponents/single-brand-selling-points-selector/single-brand-selling-points-selector.component';
import { MultiBrandSellingPointsSelectorComponent } from './entryComponents/multi-brand-selling-points-selector/multi-brand-selling-points-selector.component';
import { TagSellingPointsSelectorComponent } from './entryComponents/tag-selling-points-selector/tag-selling-points-selector.component';
import { NgDragDropModule } from 'ng-drag-drop';

@NgModule({
    imports: [
        CommonModule,
        MatTooltipModule,
        ReactiveFormsModule,
        FormsModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDialogModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatSortModule,
        MatChipsModule,
        MatButtonToggleModule,
        MatDatepickerModule,
        NgDragDropModule,
        CoreModule,
        PartialsModule,
        DateRangePickerModule,

        TranslateModule.forChild(),
    ],
    declarations: [
        CollectionsComposerContainerComponent,
        CollectionsSliderComponent,

        CollectionComposerComponent,
        CategoryComposerComponent,
        RecommendationComposerComponent,

        CategoriesSelectorComponent,
        BrandsSelectorComponent,
        SellingPointsSelectorComponent,
        CollectionsSelectorComponent,

        SingleBrandSellingPointsSelectorComponent,
        MultiBrandSellingPointsSelectorComponent,
        TagSellingPointsSelectorComponent,
    ],
    exports: [
        CollectionsComposerContainerComponent
    ],
    entryComponents: [
        CollectionComposerComponent,
        CategoryComposerComponent,
        RecommendationComposerComponent,

        CategoriesSelectorComponent,
        BrandsSelectorComponent,
        SellingPointsSelectorComponent,
        CollectionsSelectorComponent,

        SingleBrandSellingPointsSelectorComponent,
        MultiBrandSellingPointsSelectorComponent,
        TagSellingPointsSelectorComponent,
    ],
    providers: [
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                hasBackdrop: true,
                panelClass: 'm-mat-dialog-container__wrapper'
            }
        },
    ]
})

export class RecommendationComposerModule { }

export * from "./consts/index";