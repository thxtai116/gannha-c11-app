import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';

import { BehaviorSubject } from 'rxjs';

import { GalleryExplorerModel, ResourceService } from '../../../../../../core/core.module';

import { FilesConfigModel } from '../../models';

import { VideoPlayerComponent } from '../../dialogs/video-player/video-player.component';

@Component({
    selector: 'rbp-files-grid',
    templateUrl: './files-grid.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesGridComponent implements OnInit {

    @Input() files$: BehaviorSubject<GalleryExplorerModel[]> = new BehaviorSubject<GalleryExplorerModel[]>([]);
    @Input() selectedFiles$: BehaviorSubject<GalleryExplorerModel[]> = new BehaviorSubject<GalleryExplorerModel[]>([]);
    @Input() config: FilesConfigModel = new FilesConfigModel();

    @Output() onEditClick: EventEmitter<GalleryExplorerModel> = new EventEmitter<GalleryExplorerModel>();
    @Output() onRemoveClick: EventEmitter<number> = new EventEmitter<number>();
    @Output() onItemClick: EventEmitter<GalleryExplorerModel> = new EventEmitter<GalleryExplorerModel>();

    private _obsers: any[] = [];
    private FILE_NOT_FOUND: string = "./assets/app/media/img/bg/img_not_found.jpg";
    private _interval: any;

    acceptedFiles: GalleryExplorerModel[] = [];

    constructor(
        private _matDialog: MatDialog,
        private _resourceService: ResourceService,
        private _changeRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        if (this._interval)
            clearInterval(this._interval);
    }

    itemClick(item: GalleryExplorerModel): void {
        this.onItemClick.emit(item);
    }

    remove(item: GalleryExplorerModel): void {
        this.onRemoveClick.emit(item.Id);
    }

    edit(item: GalleryExplorerModel): void {
        this.onEditClick.emit(item);
    }

    updateUrl(event: any, item: GalleryExplorerModel): void {
        if (event.srcElement.src === item.Url)
            event.srcElement.src = this.FILE_NOT_FOUND;
        else
            event.srcElement.src = item.Url;
    }

    play(model: GalleryExplorerModel): void {
        this._resourceService.getVideoLink(model.Id).then(res => {
            let file = res.find(x => x.Type === "hls");

            if (file) {
                this._matDialog.open(VideoPlayerComponent, {
                    data: file.Url,
                    width: "550px",
                });
            }
        });
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.files$.subscribe(value => {
                this.acceptedFiles = [];

                if (this._interval)
                    clearInterval(this._interval);

                if (value.length > 0) {
                    this.progressiveLoad(value);
                } else {
                    this.detectFilesChange();

                    this._changeRef.detectChanges();
                }
            })
        );

        this._obsers.push(
            this.selectedFiles$.subscribe(() => {
                this.detectFilesChange();

                this._changeRef.detectChanges();
            })
        );
    }

    private detectFilesChange(): void {
        let selectedFiles = this.selectedFiles$.getValue() as GalleryExplorerModel[];

        for (let index in this.acceptedFiles) {
            if (selectedFiles.findIndex(x => x.Id === this.acceptedFiles[index].Id) > -1)
                this.acceptedFiles[index].Selected = true;
            else
                this.acceptedFiles[index].Selected = false;
        }
    }

    private load(files: GalleryExplorerModel[]): void {
        this.acceptedFiles = this.filterAcceptedFiles(files);

        this.detectFilesChange();

        this._changeRef.detectChanges();
    }

    private progressiveLoad(files: GalleryExplorerModel[]): void {
        let allFiles = this.filterAcceptedFiles(files);
        let size: number = 10;
        let page: number = 0;
        let lastIndex: number = 0;

        this.firstLoad(allFiles, size, page, lastIndex);

        lastIndex = size * page + size > allFiles.length ? allFiles.length : size * page + size;
        page += 1;

        this._interval = setInterval(() => {
            let total: number = size * page + size;
            let max = total > allFiles.length ? allFiles.length : total;
            let files: GalleryExplorerModel[] = [];

            for (let i = lastIndex; i < max; i++) {
                files.push(allFiles[i]);
            }

            if (files.length > 0) {
                this.acceptedFiles.push(...files);

                this.detectFilesChange();

                this._changeRef.detectChanges();
            }

            if (total > allFiles.length)
                clearInterval(this._interval);
            else {
                lastIndex = max;
                page++;
            }
        }, 1000);
    }

    private firstLoad(allFiles: GalleryExplorerModel[], size: number = 10, page: number = 0, lastIndex: number = 0): void {
        let total: number = size * page + size;
        let max = total > allFiles.length ? allFiles.length : total;
        let files: GalleryExplorerModel[] = [];

        for (let i = lastIndex; i < max; i++) {
            files.push(allFiles[i]);
        }

        this.acceptedFiles.push(...files);

        this.detectFilesChange();

        this._changeRef.detectChanges();
    }

    private filterAcceptedFiles(files: GalleryExplorerModel[]): GalleryExplorerModel[] {
        let filteredFiles: GalleryExplorerModel[] = [];
        let fileClones = JSON.parse(JSON.stringify(files)) as GalleryExplorerModel[];

        if (this.config.AcceptedTypes.length === 0 || this.config.AcceptedTypes.indexOf('*') > -1)
            filteredFiles.push(...fileClones);
        else
            filteredFiles.push(...fileClones.filter(x => this.config.AcceptedTypes.indexOf(x.ResourceType) > -1));

        return filteredFiles;
    }
}
