import { Component, OnInit, forwardRef, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { RequestOptions, ResponseContentType, Http, Headers } from '@angular/http';
import { MatDialogRef, MatDialog } from '@angular/material';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { SystemAlertService } from '../../../../../../core/core.module';
import { ImagesCropperComponent } from '../../../../../partials/dumbs/images-cropper/image-cropper.module';

@Component({
    selector: 'm-image-profile-selector',
    templateUrl: './image-profile-selector.component.html',
    styleUrls: ['./image-profile-selector.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ImageProfileSelectorComponent),
            multi: true,
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ImageProfileSelectorComponent implements OnInit, ControlValueAccessor {

    private _onChangeCallback: (_: any) => void = () => { };
    private _obsers: any[] = [];

    // @Input() readonly: boolean = true;
    readonly: boolean = true;

    viewData: any = {
        image$: new BehaviorSubject<string>(null)
    };

    dialogRef: MatDialogRef<ImagesCropperComponent>;

    constructor(
        public dialog: MatDialog,
        private _http: Http,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _changeRef: ChangeDetectorRef,
    ) { }

    writeValue(obj: any): void {
        if (obj) {
            this.viewData.image$.next(obj);
        }
    }
    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState?(isDisabled: boolean): void {
        this.readonly = isDisabled;

        this._changeRef.detectChanges();
    }

    ngOnInit() {
    }

    changeImage() {
        this.dialogRef = this.dialog.open(ImagesCropperComponent, {
            width: '1000px', height: 'auto', disableClose: true
        });

        this.dialogRef.componentInstance.open();
        this.dialogRef.componentInstance.imageFile = null;

        this._obsers.push(
            this.dialogRef.componentInstance.onImagesChange.subscribe(value => {
                this.onImagesCroppedChange(value);
            })
        );

        this._obsers.push(
            this.dialogRef.componentInstance.onImageUrlChange.subscribe(value => {
                this.onImageUrlChange(value);
            })
        );
    }

    private onImagesCroppedChange(resources: string[]) {
        if (resources.length > 0) {
            this.viewData.image$.next(resources[0]);
            this._onChangeCallback(resources[0]);
        }
    }

    private async onImageUrlChange(event: string) {
        let reqHeaders = new Headers();

        let reqOptions = new RequestOptions({ headers: reqHeaders, responseType: ResponseContentType.Blob });

        await this._http.get(event, reqOptions)
            .toPromise()
            .then((res: any) => {
                let blob = new Blob([res._body], {
                    type: res.headers.get("Content-Type")
                });
                this.createFileFromBlob(blob);
            }).catch((error: any) => {
                this._systemAlertService.error(this._translate.instant("IMAGE_CAROUSEL.UNABLE_TO_DOWNLOAD"));
            });
    }

    createFileFromBlob(theBlob: Blob) {
        var b: any = theBlob;

        b.lastModifiedDate = new Date();
        b.name = "image.jpg";

        this.dialogRef.componentInstance.imageFile = <File>theBlob;
        this.dialogRef.componentInstance.viewControl.loading$.next(false);
    }
}
