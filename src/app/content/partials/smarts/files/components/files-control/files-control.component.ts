import { Component, OnInit, forwardRef, Input, Injector, ChangeDetectorRef, ElementRef, ViewChild, Renderer } from '@angular/core';
import { NG_VALUE_ACCESSOR, NgControl, ControlValueAccessor } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { TranslateService } from '@ngx-translate/core';

import { BehaviorSubject } from 'rxjs';

import {
    ResourceModel,
    GalleryExplorerModel,

    DictionaryType,

    GalleryResourceType,
    ResourceType,

    SystemAlertService,
    ResourceService,
} from '../../../../../../core/core.module';

import { environment as env } from "../../../../../../../environments/environment";

import { FilesManagerContainerComponent } from '../../dialogs/files-manager-container/files-manager-container.component';

import { ImagesUploaderComponent } from '../../dialogs/images-uploader/images-uploader.component';

@Component({
    selector: 'rbp-files-control',
    templateUrl: './files-control.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FilesControlComponent),
            multi: true
        }
    ]
})
export class FilesControlComponent implements OnInit, ControlValueAccessor {
    @ViewChild("imageInput", { static: false }) imageInput: ElementRef;

    @Input() showUpload: boolean = true;
    @Input() showRemove: boolean = true;
    @Input() limitted: number = -1;
    @Input() acceptedType: string[] = ['*'];
    @Input() buttons: string[] = ['*'];
    @Input() templates: string[] = [];
    @Input() additional: DictionaryType = {};
    @Input() quickUpload: ResourceType;

    private _onChangeCallback: (_: any) => void = () => { };

    private _files: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

    private _obsers: any[] = [];

    private IMAGE_ACCEPTED_TYPES: string[] = ["image/jpg", "image/png", "image/jpeg"];
    private HTTP: string = "http://";
    private HTTPS: string = "https://";

    lang: string = "vi";

    get files(): any[] {
        return this._files.getValue();
    }

    ngControl: NgControl;

    viewControl: any = {
        showUpload: true,
        showLoading: false
    };

    constructor(
        private _injector: Injector,
        private _dialog: MatDialog,
        private _changeRef: ChangeDetectorRef,
        private _renderer: Renderer,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _resourceService: ResourceService,
    ) {
    }

    ngOnInit(): void {
        this.initFormControl();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: any): void {
        if (obj) {
            this._files.next(obj);

            this.updateViewControl();
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState?(isDisabled: boolean): void {
    }

    onRemove(index: number): void {
        let models = JSON.parse(JSON.stringify(this.files));

        if (index >= models.length)
            return;

        models.splice(index, 1);

        this.updateAfterModification(models);
    }

    onUpload(): void {
        switch (this.quickUpload) {
            case ResourceType.Image:
                this.openImageUploader();

                break;

            default:
                this.openFileManager();

                break;
        }
    }

    onOrder(models: ResourceModel[]): void {
        this._files.next(models);

        this._onChangeCallback(this.files);

        this._changeRef.detectChanges();
    }

    onImagesSelected(event: any) {
        if (!this.checkFileList(event.srcElement.files, this.IMAGE_ACCEPTED_TYPES)) {
            this._systemAlertService.error(this._translate.instant("RESOURCES.CRUD_MESSAGE.IMAGE_TYPE_ERROR"));

            return;
        }

        const dialogRef = this._dialog.open(ImagesUploaderComponent, {
            data: { Images: event.srcElement.files }, disableClose: true, width: "1000px"
        });

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.uploadImages(res.data);
        });

        this._obsers.push(sub);
    }

    private async uploadImages(files: any[]) {
        if (this.files.length >= this.limitted)
            return;

        this.viewControl.showLoading = true;

        this._changeRef.detectChanges();

        let uploadedFiles: any[] = [];

        for (let i = 0; i < files.length; i++) {
            let file = files[i];

            if (this.files.length + uploadedFiles.length < this.limitted) {
                let result = await this._resourceService.uploadPhotoToFolder(file.file, 0, file.name, "");

                if (result) {
                    this.updateThumbnail(result);

                    uploadedFiles.push({
                        Id: result.Id,
                        Type: this.handleResourceType(result),
                        Url: result.Url,
                        Thumbnail: result.Thumbnail,
                        Order: result.Order,
                        Name: result.Name,
                    });
                }
            }
        }

        this._systemAlertService.success(this._translate.instant("RESOURCES.CRUD_MESSAGE.UPLOAD_SUCCESSFUL"));

        this.viewControl.showLoading = false;

        let curValue = this.files;

        this.updateAfterModification(curValue.concat(this.indexing(uploadedFiles)));
    }

    private openImageUploader(): void {
        this.imageInput.nativeElement.value = "";

        let event = new MouseEvent('click', { bubbles: true });

        this._renderer.invokeElementMethod(this.imageInput.nativeElement, "dispatchEvent", [event]);
    }

    private openFileManager(): void {
        let dialogRef = this._dialog.open(FilesManagerContainerComponent, {
            width: "89%",
            data: {
                AcceptedTypes: this.acceptedType && this.acceptedType.length > 0 ? this.acceptedType : ['*'],
                Limitted: this.limitted - this.files.length,
                Templates: this.templates,
                Additional: this.additional,
                Buttons: this.buttons,
            },
            disableClose: true
        });

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res || !res.data)
                return;

            let models: any[] = (res.data as GalleryExplorerModel[]).map(x => {
                return {
                    Id: x.Id,
                    Type: this.handleResourceType(x),
                    Url: x.Url,
                    Thumbnail: x.Thumbnail,
                    Order: x.Order,
                    Name: x.Name,
                }
            });

            let curValue = this.files;

            this.updateAfterModification(curValue.concat(this.indexing(models)));
        });

        this._obsers.push(sub);
    }

    private updateAfterModification(files: any): void {
        this._files.next(files);

        this.updateViewControl();

        this._onChangeCallback(this.files);

        this._changeRef.detectChanges();
    }

    private handleResourceType(model: GalleryExplorerModel): ResourceType {
        let resType = this.explorerTypeToResourceType(model.ResourceType);

        if (resType === ResourceType.Video)
            resType = model.Thumbnail.length === 0 ? ResourceType.Video : ResourceType.HLS;

        return resType;
    }

    private updateViewControl(): void {
        this.viewControl.showUpload = this.files.length < this.limitted || this.limitted === -1;
    }

    private indexing(models: any[]): any[] {
        let newModels = [];

        let i = 1;

        for (let item of models) {
            item.Order = i++;
            newModels.push(item);
        }

        return newModels;
    }

    private initFormControl(): void {
        try {
            const ngControl = this._injector.get(NgControl);

            if (ngControl) {
                this.ngControl = ngControl;
            }
        } catch (error) {
            console.log("FormControl or ngModel required");
        }
    }

    private checkFileList(list: FileList, types: string[]): boolean {
        for (let i = 0; i < list.length; i++) {
            if (!types.includes(list[i].type)) {
                return false;
            }
        }
        return true;
    }

    private updateThumbnail(model: GalleryExplorerModel): void {
        if (model.Path)
            model.Url = model.Path.indexOf(this.HTTP) > -1 || model.Path.indexOf(this.HTTPS) > -1 ? model.Path : `${env.fileStorageEndpoint}${model.Path}`;

        if (model.Thumbnail)
            model.Thumbnail = model.Thumbnail && (model.Thumbnail.indexOf(this.HTTP) > -1 || model.Thumbnail.indexOf(this.HTTPS) > -1) ?
                model.Thumbnail :
                `${env.fileStorageEndpoint}${model.Thumbnail}`;
    }

    private explorerTypeToResourceType(fileType: string): ResourceType {
        let type = ResourceType.Folder;

        switch (fileType) {
            case GalleryResourceType.DOCUMENTS_TYPE:
                type = ResourceType.File;
                break;

            case GalleryResourceType.IMAGE_TYPE:
                type = ResourceType.Image;
                break;

            case GalleryResourceType.VIDEO_TYPE:
                type = ResourceType.Video;
                break;
        }

        return type;
    }
}
