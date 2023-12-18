import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Renderer, SimpleChange, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'm-images-cropper',
    templateUrl: './images-cropper.component.html',
    styleUrls: ['./images-cropper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagesCropperComponent implements OnInit {

    @Output() onImagesChange: EventEmitter<string[]> = new EventEmitter<string[]>();
    @Output() onImageUrlChange: EventEmitter<string> = new EventEmitter<string>();

    @ViewChild("imageInput", { static: true }) imageInput: ElementRef;

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    show: boolean = false;
    url: string = "";
    imageFile: any = '';
    croppedImages: string[] = [];
    isAspectRatio: boolean = true;
    aspectRatio: number = 191 / 100;
    currentMode: number = 0;
    _MODE: number = 1;
    imageFiles: File[] = [];
    componentName: string = ImagesCropperComponent.name;
    modalConfig = {
        backdrop: "static"
    };
    
    FACEBOOK_MODE: number = 0;

    SQUARE_MODE: number = 1;

    FREE_MODE: number = 2;

    LANDSCAPE_MODE: number = 3;

    constructor(
        private _renderer: Renderer,
        public dialogRef: MatDialogRef<ImagesCropperComponent>,
        private _changeRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit(): void {
    }

    async open() {
        this.imageInput.nativeElement.value = "";
        this.imageFile = null;
    }

    close() {
        this.show = false;
        this.imageFile = null;
        this.dialogRef.close();
    }

    async onFileChange(event: any) {
        this.imageFiles = [];
        this.imageFiles = event.srcElement.files
        this.imageFile = this.imageFiles[0];
    }

    imageCropped(event: string) {
        this.croppedImages[0] = event;
    }

    imageCroppedFile(event) {

    }

    async ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            if (propName === "resources") {

            }
        }
    }

    uploadPhoto() {
        let event = new MouseEvent('click', { bubbles: true });
        this._renderer.invokeElementMethod(this.imageInput.nativeElement, "dispatchEvent", [event]);
    }

    save() {
        this.onImagesChange.emit(this.croppedImages);
        this.close();
    }

    changeRadio() {
        if (this.currentMode == this.FREE_MODE) {
            this.isAspectRatio = false;
        }
        else if (this.currentMode == this.SQUARE_MODE) {
            this.isAspectRatio = true;
            this.aspectRatio = 1 / 1;
        } else if (this.currentMode == this.FACEBOOK_MODE) {
            this.isAspectRatio = true;
            this.aspectRatio = 191 / 100;
        } else {
            this.isAspectRatio = true;
            this.aspectRatio = 16 / 9;
        }
    }

    onUrlChange() {
        if (this.url.trim().length > 0) {
            let url = this.url.trim();
            this.onImageUrlChange.emit(url);
            this.viewControl.loading$.next(true);
        }
    }

    pastePicture(event) {
        if (event.clipboardData.files.length > 0) {
            if (event.clipboardData.files[0].type === "image/png") {
                this.imageFile = event.clipboardData.files[0];
            }
        }
    }

    imageLoaded() {

    }

    loadImageFailed() {

    }

}
