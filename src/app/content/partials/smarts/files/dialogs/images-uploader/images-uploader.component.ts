import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, ElementRef, Renderer, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { ImageCroppedEvent, CropperPosition } from 'ngx-image-cropper';

import { GalleryResourceType } from '../../../../../../core/core.module';

export class PreviewImage {
    PreviewUrl: any = null;
    File: File;
    Selected: boolean = false;
    CroppedImage: string = "";
    AspectRatioMode: number = 0;
    CropperPosition: CropperPosition = { x1: 0, y1: 0, x2: 0, y2: 0 };
}

@Component({
    selector: 'rbp-images-uploader',
    templateUrl: './images-uploader.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagesUploaderComponent implements OnInit {

    @ViewChild("imageInput", { static: true }) imageInput: ElementRef;

    isAspectRatio: boolean = false;
    aspectRatio: number = 191 / 100;
    FACEBOOK_MODE: number = 0;
    SQUARE_MODE: number = 1;
    FREE_MODE: number = 2;
    LANDSCAPE_MODE: number = 3;

    viewData: any = {
        previewImages: new Array<PreviewImage>(),
    }

    currentImage: any = '';
    currentCropPostion: CropperPosition = { x1: 10, y1: 10, x2: 10, y2: 10 };
    currentAspectRatioMode: number = 0;
    changeDetectCount: number = 0;

    constructor(
        public dialogRef: MatDialogRef<ImagesUploaderComponent>,
        private _changeRef: ChangeDetectorRef,
        private _renderer: Renderer,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit() {
        this.parseImage(this.data.Images);
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit() {
        this.dialogRef.close({
            data: this.viewData.previewImages.map(x => { return { file: x.CroppedImage, name: x.File.name, resourceType: GalleryResourceType.IMAGE_TYPE }; })
        });
    }

    onImageClicked(image: PreviewImage) {
        let oldImage = this.viewData.previewImages.find(x => x.Selected);
        if (oldImage) {
            oldImage.Selected = false;
        }

        image.Selected = !image.Selected;

        this.currentImage = image.File;

        this.currentAspectRatioMode = image.AspectRatioMode;

        this.changeDetectCount = 0;

        this.changeRadio();
    }

    onAddImage() {
        let event = new MouseEvent('click', { bubbles: true });
        this._renderer.invokeElementMethod(this.imageInput.nativeElement, "dispatchEvent", [event]);
    }

    removeImage(image: PreviewImage) {
        var index = this.viewData.previewImages.indexOf(image);

        this.viewData.previewImages.splice(index, 1);

        if (this.viewData.previewImages.length > 0) {
            this.onImageClicked(this.viewData.previewImages[0]);
        }
    }

    imageCropped(event: ImageCroppedEvent) {
        this.changeDetectCount += 1;
        if (this.changeDetectCount == 1) {
            this.viewData.previewImages.find(x => x.Selected).CroppedImage = event.base64;
            return;
        }
        let currentItem = this.viewData.previewImages.find(x => x.Selected);

        if (!currentItem) return;

        currentItem.CropperPosition = event.cropperPosition;
        currentItem.CroppedImage = event.base64;
    }

    imageLoaded() {
        setTimeout(() => {
            let currentItem = this.viewData.previewImages.find(x => x.Selected);

            if (!currentItem) return;

            if (currentItem.CropperPosition.x1 == 0
                && currentItem.CropperPosition.x2 == 0
                && currentItem.CropperPosition.y1 == 0
                && currentItem.CropperPosition.y2 == 0) return;

            this.currentCropPostion = currentItem.CropperPosition;

            this._changeRef.detectChanges();
        }, 100);
    }

    changeRadio() {
        let currentItem = this.viewData.previewImages.find(x => x.Selected);

        if (!currentItem) return;

        currentItem.AspectRatioMode = this.currentAspectRatioMode;

        if (currentItem.AspectRatioMode == this.FREE_MODE) {
            this.isAspectRatio = false;
        }
        else if (currentItem.AspectRatioMode == this.SQUARE_MODE) {
            this.isAspectRatio = true;
            this.aspectRatio = 1 / 1;
        } else if (currentItem.AspectRatioMode == this.FACEBOOK_MODE) {
            this.isAspectRatio = true;
            this.aspectRatio = 191 / 100;
        } else {
            this.isAspectRatio = true;
            this.aspectRatio = 16 / 9;
        }

        this.currentCropPostion = currentItem.CropperPosition;

        this._changeRef.detectChanges();
    }

    async onFileChange(event: any) {
        this.parseImage(event.srcElement.files);
    }

    private parseImage(data: FileList) {
        for (var i = 0; i < data.length; i++) {

            let file = data.item(i);

            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (_event) => {
                let image = new PreviewImage();
                image.PreviewUrl = reader.result;
                image.CroppedImage = reader.result.toString();
                image.File = file;

                if (!this.currentImage) {
                    this.currentImage = image.File;
                    image.Selected = true;
                }

                this.viewData.previewImages.push(image);

                this.changeRadio();
            };
        }

        this._changeRef.detectChanges();
    }
}
