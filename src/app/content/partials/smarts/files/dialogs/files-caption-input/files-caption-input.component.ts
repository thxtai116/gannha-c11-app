import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import { BehaviorSubject } from 'rxjs';

import { GalleryResourceType } from '../../../../../../core/core.module';

export class FileCaption {
    Path: any;
    FileName: string = "";
    File: any;
    Caption: string = "";
    ResourceType: string = GalleryResourceType.IMAGE_TYPE;
}

@Component({
    selector: 'rbp-files-caption-input',
    templateUrl: './files-caption-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesCaptionInputComponent implements OnInit {
    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
    }

    files: FileCaption[] = [];

    constructor(
        public _dialogRef: MatDialogRef<FilesCaptionInputComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _sanitizer: DomSanitizer
    ) { }

    ngOnInit() {
        this.parseImages(this.data);
    }

    onCancel(): void {
        this._dialogRef.close();
    }

    onSubmit() {
        this._dialogRef.close({
            data: this.files.map(x => { return { file: x.File, name: x.FileName, caption: x.Caption }; })
        });
    }

    private parseImages(data: any) {
        if (data) {
            data.forEach(x => {
                let file = new FileCaption();

                file.Caption = x.name;
                file.FileName = x.name;
                file.Path = x.resourceType == GalleryResourceType.IMAGE_TYPE ? this._sanitizer.bypassSecurityTrustResourceUrl(x.file) : null;
                file.File = x.file;
                file.ResourceType = x.resourceType;
                this.files.push(file);
            });
        }
    }

}
