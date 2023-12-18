import { Component, OnInit, ViewChild, ElementRef, Input, Renderer, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MdePopoverTrigger } from '@material-extended/mde';

import { GalleryExplorerModel } from '../../../../../../core/models';

import { FilesManagerConfigModel, FilesConfigModel } from '../../models';
import {
    SystemAlertService,
    ConfirmService,
    ResourceService,
    ExplorerService,
    FolderService,

    GalleryResourceType,
    DictionaryType
} from '../../../../../../core/core.module';

import { FilesInfoComponent } from '../../dialogs/files-info/files-info.component';

import { ImagesUploaderComponent } from '../../dialogs/images-uploader/images-uploader.component';

@Component({
    selector: 'rbp-files-manager',
    templateUrl: './files-manager.component.html',
})
export class FilesManagerComponent implements OnInit {
    @ViewChild("imageInput", { static: false }) imageInput: ElementRef;
    @ViewChild("documentInput", { static: false }) documentInput: ElementRef;
    @ViewChild("videoInput", { static: false }) videoInput: ElementRef;
    @ViewChild(MdePopoverTrigger, { static: false }) popoverTrigger: MdePopoverTrigger;

    @Input()
    get config(): FilesManagerConfigModel {
        return this._config$.getValue();
    }
    set config(value: FilesManagerConfigModel) {
        this._config$.next(value);
    }

    @Output() onSelectedFilesChange: EventEmitter<GalleryExplorerModel[]> = new EventEmitter<GalleryExplorerModel[]>();

    private _obsers: any[] = [];
    private _config$: BehaviorSubject<FilesManagerConfigModel> = new BehaviorSubject<FilesManagerConfigModel>(null);

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        buttons: {}
    }

    viewData: any = {
        explorers$: new BehaviorSubject<GalleryExplorerModel[]>([]),
        gridConfig: new FilesConfigModel()
    }

    currentFolder: any = null;
    folderPath: any[] = [];
    form: FormGroup;
    selectedFiles$: BehaviorSubject<GalleryExplorerModel[]> = new BehaviorSubject<GalleryExplorerModel[]>([]);

    constructor(
        private _dialog: MatDialog,
        private _systemAlertService: SystemAlertService,
        private _confirmService: ConfirmService,
        private _resourceService: ResourceService,
        private _explorerService: ExplorerService,
        private _folderService: FolderService,
        private _translate: TranslateService,
        private _renderer: Renderer,
        private _changeRef: ChangeDetectorRef
    ) {
        this.form = this.generateForm();
    }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngAfterViewInit(): void {
        this.setCurrentFolder(0, 'Root');

        this.init();
    }

    onClear(): void {
        this.clearSelectedFiles();
    }

    onRemoveClick(id: number): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('RESOURCES.CRUD_MESSAGE.CONFIRM_DELETE'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (res)
                this.executeDelete(id);

            sub.unsubscribe();
        });
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    onItemClick(item: GalleryExplorerModel): void {
        if (item.ResourceType === GalleryResourceType.FOLDER_TYPE) {
            this.setCurrentFolder(item.Id, item.Name);

            this.onReload();

            this.clearSelectedFiles();

        } else if (item.ResourceType === GalleryResourceType.IMAGE_TYPE &&
            (this.config.AcceptedTypes.indexOf('*') > -1 || this.config.AcceptedTypes.indexOf(GalleryResourceType.IMAGE_TYPE) > -1)) {
            this.markFileSelected(item);
        } else if (item.ResourceType === GalleryResourceType.DOCUMENTS_TYPE &&
            (this.config.AcceptedTypes.indexOf('*') > -1 || this.config.AcceptedTypes.indexOf(GalleryResourceType.DOCUMENTS_TYPE) > -1)) {
            this.markFileSelected(item);
        }
        else if (item.ResourceType === GalleryResourceType.VIDEO_TYPE &&
            (this.config.AcceptedTypes.indexOf('*') > -1 || this.config.AcceptedTypes.indexOf(GalleryResourceType.VIDEO_TYPE) > -1)) {
            this.markFileSelected(item);
        }
    }

    //#region Control Board

    onBack(): void {
        if (this.folderPath.length <= 1)
            return;

        this.currentFolder = this.folderPath[this.folderPath.length - 2];

        this.folderPath.pop();

        this.onReload();
    }

    onFolderPathClick(folder: any): void {
        this.currentFolder = { Id: folder.Id, Name: folder.Name };

        while (this.folderPath[this.folderPath.length - 1].Id !== folder.Id) {
            this.folderPath.pop();
        }

        this.onReload();
    }

    onReload(): void {
        this.explorerFolder(this.currentFolder);
    }

    onUploadImagesClick(): void {
        this.imageInput.nativeElement.value = "";

        let event = new MouseEvent('click', { bubbles: true });

        this._renderer.invokeElementMethod(this.imageInput.nativeElement, "dispatchEvent", [event]);
    }

    onUploadFilesClick(): void {
        this.documentInput.nativeElement.value = "";

        let event = new MouseEvent('click', { bubbles: true });

        this._renderer.invokeElementMethod(this.documentInput.nativeElement, "dispatchEvent", [event]);
    }

    onUploadVideosClick(): void {
        this.videoInput.nativeElement.value = "";

        let event = new MouseEvent('click', { bubbles: true });

        this._renderer.invokeElementMethod(this.videoInput.nativeElement, "dispatchEvent", [event]);
    }

    //#endregion

    //#region Upload Control

    async onImagesSelected(event: any) {

        if (!this.checkFileList(event.srcElement.files, ["image/jpg", "image/png", "image/jpeg"])) {
            this._systemAlertService.error(this._translate.instant("RESOURCES.CRUD_MESSAGE.IMAGE_TYPE_ERROR"));
            return;
        }

        const dialogRef = this._dialog.open(ImagesUploaderComponent, {
            data: { Images: event.srcElement.files }, disableClose: true, width: "1000px"
        });

        let sub = dialogRef.afterClosed().subscribe(async res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            if (res.data && res.data.length > 0) {
                for (let i = 0; i < res.data.length; i++) {
                    if (res.data[i].file.length > 0) {
                        let result = await this._resourceService.uploadPhotoToFolder(res.data[i].file, this.currentFolder.Id, res.data[i].name, res.data[i].name);
                        if (!result) {
                            this.viewControl.loading$.next(false);
                            return;
                        }
                    }
                }
                this._systemAlertService.success(this._translate.instant("RESOURCES.CRUD_MESSAGE.UPLOAD_SUCCESSFUL"));
                this.onReload();
            }

            this.viewControl.loading$.next(false);

            sub.unsubscribe();
        });
    }

    async onDocumentFileChange(event: any) {
        if (event.srcElement.files && event.srcElement.files.length > 0) {

            if (!this.checkFileList(event.srcElement.files, ["application/pdf"])) {
                this._systemAlertService.error(this._translate.instant("RESOURCES.CRUD_MESSAGE.DOCUMENT_TYPE_ERROR"));
                return;
            }

            let files: any[] = [];

            for (let i = 0; i < event.srcElement.files.length; i++) {
                let file = { file: event.srcElement.files[i], name: event.srcElement.files[i].name, resourceType: GalleryResourceType.DOCUMENTS_TYPE };
                files.push(file);
            }

            this.viewControl.loading$.next(true);

            for (let i = 0; i < files.length; i++) {
                let result = await this._resourceService.uploadFileToFolder(files[i].file, this.currentFolder.Id, files[i].name);
                if (!result) {
                    this.viewControl.loading$.next(false);
                    return;
                }
            }
            this._systemAlertService.success(this._translate.instant("RESOURCES.CRUD_MESSAGE.UPLOAD_SUCCESSFUL"));
            this.onReload();

            this.viewControl.loading$.next(false);
        }
    }


    async onVideoFileChange(event: any) {
        if (event.srcElement.files && event.srcElement.files.length > 0) {

            if (!this.checkFileList(event.srcElement.files, ["video/mp4"])) {
                this._systemAlertService.error(this._translate.instant("RESOURCES.CRUD_MESSAGE.VIDEO_TYPE_ERROR"));
                return;
            }

            let files: any[] = [];

            for (let i = 0; i < event.srcElement.files.length; i++) {
                let file = { file: event.srcElement.files[i], name: event.srcElement.files[i].name, resourceType: GalleryResourceType.VIDEO_TYPE };
                files.push(file);
            }

            this.viewControl.loading$.next(true);

            for (let i = 0; i < files.length; i++) {
                let result = await this._resourceService.uploadFileToFolder(files[i].file, this.currentFolder.Id, files[i].caption);
                if (!result) {
                    this.viewControl.loading$.next(false);
                    return;
                }
            }
            this._systemAlertService.success(this._translate.instant("RESOURCES.CRUD_MESSAGE.UPLOAD_VIDEO_SUCCESSFUL"));
            this.onReload();

            this.viewControl.loading$.next(false);
        }
    }

    //#endregion

    //#region Folder

    private clearSelectedFiles(): void {
        this.selectedFiles$.next([]);

        this.emitFilesChange();
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._config$.subscribe(value => {
                if (value) {
                    this.viewControl.buttons = this.generateButtons(this.config.Buttons);
                }
            })
        );
    }

    private generateButtons(buttons: string[]): DictionaryType {
        let enabledButtons: DictionaryType = {};

        if (buttons.indexOf('*') > -1)
            enabledButtons = {
                file: true,
                image: true,
                folder: true,
                video: true
            }
        else {
            buttons.forEach(x => {
                enabledButtons[x] = true
            })
        }

        return enabledButtons;
    }

    private executeDelete(id: number): void {
        this.viewControl.loading$.next(true);

        this._resourceService.delete(id).then(res => {
            if (res) {
                this._systemAlertService.success(this._translate.instant("RESOURCES.CRUD_MESSAGE.DELETE_SUCCESSFUL"));

                this.onReload();
            }
        }).catch(() => this.viewControl.loading$.next(false));
    }

    onFolderFormClose(): void {
        this.form.reset();
    }

    onSubmitFolder(): void {
        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );

            return;
        }

        if (this.folderPath.length === 1)
            this.createFolder(this.Name.value, null);
        else {
            let lastFolder = this.folderPath[this.folderPath.length - 1];

            this.createFolder(this.Name.value, lastFolder.Id);
        }

        this.form.reset();
        this.popoverTrigger.closePopover();
    }

    onEditClick(model: GalleryExplorerModel): void {
        const dialogRef = this._dialog.open(FilesInfoComponent, {
            data: {
                file: model
            },
            disableClose: true,
            width: "50%"
        });

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (res)
                this.onReload();

            sub.unsubscribe();
        });
    }

    get Name() { return this.form.get('Name'); }

    //#endregion

    private emitFilesChange(): void {
        this.onSelectedFilesChange.emit(this.selectedFiles$.getValue());
    }

    private markFileSelected(file: GalleryExplorerModel): void {
        let files = this.selectedFiles$.getValue() as GalleryExplorerModel[];
        let index = files.findIndex(x => x.Id === file.Id);

        if (index === -1) {
            let selectedFile = (this.viewData.explorers$.getValue() as GalleryExplorerModel[]).find(x => x.Id === file.Id);

            if (selectedFile && (!this.config.Limitted || this.config.Limitted <= 0 || files.length < this.config.Limitted)) {
                files.push(selectedFile);

                this.selectedFiles$.next(files);
                this.emitFilesChange();
            }
        } else {
            files.splice(index, 1);

            this.selectedFiles$.next(files);
            this.emitFilesChange();
        }
    }

    private createFolder(name: string, parent: string): void {
        this.viewControl.loading$.next(true);

        this._folderService.createFolder(name, parent).then(res => {
            if (res) {
                this._systemAlertService.success(this._translate.instant("RESOURCES.FOLDERS.CRUD_MESSAGE.CREATE_SUCCESSFUL"))

                this.onReload();
            }
        }).finally(() => this.viewControl.loading$.next(false));
    }

    private explorerFolder(folder: GalleryExplorerModel): void {
        this.viewControl.loading$.next(true);

        this._explorerService.getExplorerItem(folder.Id, this.config.IncludeHidden).then(res => {
            if (res) {
                this.remarkSelectedFiles(res);

                var files = this.filterAcceptedTypes(res);

                this.viewData.explorers$.next(files);

                this.emitFilesChange();

                this._changeRef.detectChanges();
            }
        }).finally(() => this.viewControl.loading$.next(false));
    }

    private filterAcceptedTypes(models: GalleryExplorerModel[]): GalleryExplorerModel[] {
        let files: GalleryExplorerModel[] = [];

        if (this.config.AcceptedTypes.indexOf('*') > -1)
            files = models;
        else
            files = models.filter(x => this.config.AcceptedTypes.indexOf(x.ResourceType) > -1);

        return files;
    }

    private remarkSelectedFiles(models: GalleryExplorerModel[]) {
        let files = (this.viewData.explorers$.getValue() as GalleryExplorerModel[]).filter(x => x.Selected);

        for (let model of models) {
            if (files.findIndex(x => x.Id === model.Id) > -1)
                model.Selected = true;
        }
    }

    private setCurrentFolder(id: any, name: string): void {
        this.currentFolder = {
            Id: id,
            Name: name
        };

        this.folderPath.push({
            Id: id,
            Name: name
        });
    }

    private init() {
        this.onReload();
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Name: new FormControl("", [<any>Validators.required]),
        });
    }

    private checkFileList(list: FileList, types: string[]): boolean {
        for (let i = 0; i < list.length; i++) {
            if (!types.includes(list[i].type)) {
                return false;
            }
        }
        return true;
    }
}
