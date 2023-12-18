import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MAT_DIALOG_DEFAULT_OPTIONS,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatMenuModule,
    MatCardModule,
    MatGridListModule,
    MatProgressSpinnerModule,
} from '@angular/material';

import { MdePopoverModule } from '@material-extended/mde';
import { NgDragDropModule } from 'ng-drag-drop';

import { TranslateModule } from '@ngx-translate/core';
import { ImageCropperModule } from "ngx-image-cropper";

import { DynamicFilesManagerDirective } from './directives';

import { CoreModule } from '../../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';

import {
    FileComponent,
    FilesControlComponent,
    FilesGridComponent,
    FilesManagerComponent,
    FilesListComponent,
} from './components';

import {
    ImagesUploaderComponent,
    FilesManagerContainerComponent,
    FilesInfoComponent,
    FilesCaptionInputComponent,
    VideoPlayerComponent
} from './dialogs';

@NgModule({
    declarations: [
        DynamicFilesManagerDirective,

        FileComponent,
        FilesControlComponent,
        FilesGridComponent,
        FilesManagerComponent,
        FilesListComponent,

        FilesInfoComponent,
        FilesCaptionInputComponent,
        FilesManagerContainerComponent,

        ImagesUploaderComponent,
        VideoPlayerComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        MatRadioModule,
        MatMenuModule,
        MatCardModule,
        MatGridListModule,
        MatProgressSpinnerModule,

        NgDragDropModule,
        MdePopoverModule,
        ImageCropperModule,

        CoreModule,
        PartialsModule,

        TranslateModule,
    ],
    exports: [
        DynamicFilesManagerDirective,

        FilesControlComponent,

        FilesManagerComponent,
    ],
    entryComponents: [
        ImagesUploaderComponent,
        VideoPlayerComponent,
        FilesInfoComponent,
        FilesCaptionInputComponent,
        FilesManagerContainerComponent,
        FilesManagerComponent,
    ],
    providers: [
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                hasBackdrop: true,
                panelClass: ['m-mat-dialog-container__wrapper'],
                height: 'auto',
                width: 'auto'
            }
        },
    ],
})
export class FilesModule {

}

export * from "./components/index";
export * from "./models/index";