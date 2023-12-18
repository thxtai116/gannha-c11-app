import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, } from '@angular/core';
import { MatDialog } from '@angular/material';

import { BehaviorSubject } from 'rxjs';

import { ResourceModel, ResourceType, ResourceService } from '../../../../../../core/core.module';

import { VideoPlayerComponent } from '../../dialogs/video-player/video-player.component';

interface ImagesSelectConfig {
    ImageClasses: string;
}

@Component({
    selector: 'rbp-files-list',
    templateUrl: './files-list.component.html',
})
export class FilesListComponent implements OnInit {
    @Input() showUpload: boolean = true;
    @Input() showRemove: boolean = true;
    @Input() showLoading: boolean = false;
    @Input() limitted: number = -1;
    @Input() options: ImagesSelectConfig;
    @Input()
    set data(value) {
        let models = this.indexing(value);

        this.handleVideo(models);

        this.data$.next(models);
    }

    get data() {
        return this.data$.getValue();
    }

    @Output() onRemoveClick: EventEmitter<number> = new EventEmitter<number>();
    @Output() onUploadClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() onOrderChange: EventEmitter<any[]> = new EventEmitter<any[]>();

    private _obsers: any[] = [];

    data$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

    totalItems: number = 0;

    constructor(
        private _resourceService: ResourceService,
        private _matDialog: MatDialog,
        private _changeRef: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngAfterViewInit(): void {
    }

    upload(): void {
        this.onUploadClick.emit("0");
    }

    remove(index: number): void {
        this.onRemoveClick.emit(index);
    }

    zoom(): void {
        alert("Zoom click here !!");
    }

    onDrop(event: any, item: any) {
        let models = this.data;

        let preFile = models.find(x => x.Order === event.dragData.Order);
        let nextFile = models.find(x => x.Order === item.Order);
        let order = JSON.parse(JSON.stringify(preFile.Order));

        preFile.Order = nextFile.Order;
        nextFile.Order = order;

        models = models.sort((a, b) => {
            if (a.Order > b.Order) {
                return 1;
            }

            if (a.Order < b.Order) {
                return -1;
            }

            return 0;
        });

        this.data = this.indexing(models);

        this.onOrderChange.emit(this.data);
    }

    updateUrl(event: any, item: any): void {
        event.srcElement.src = item.Url;
    }

    play(model: ResourceModel): void {
        this._matDialog.open(VideoPlayerComponent, {
            data: model.Url,
            width: "550px",
        });
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

    private bindSubscribes(): void {
        this._obsers.push(
            this.data$.subscribe(res => {
                this.totalItems = res.length;
            })
        );
    }

    private handleVideo(models: ResourceModel[]): void {
        let detactChanges: boolean = false;

        for (let i in models) {
            let model: ResourceModel = models[i];

            if (model.Type === ResourceType.Video || model.Type === ResourceType.HLS) {
                this._resourceService.getVideoLink(model.Id).then(res => {
                    let file = res.find(x => x.Type === "hls");

                    if (file) {
                        models[i].Thumbnail = "Thumbnail";
                        models[i].Url = file.Url;

                        detactChanges = true;
                    }
                });
            }
        }

        if (detactChanges)
            this._changeRef.detectChanges();
    }
}
