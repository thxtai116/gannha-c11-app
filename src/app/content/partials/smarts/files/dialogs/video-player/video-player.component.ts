import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { BehaviorSubject } from 'rxjs';
import * as Hls from 'hls.js';

@Component({
    selector: 'm-video-player',
    templateUrl: './video-player.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerComponent implements OnInit {

    @ViewChild("videoPlayer", { static: true }) videoPlayer: ElementRef<HTMLVideoElement>;

    constructor(
        private _dialogRef: MatDialogRef<VideoPlayerComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MatDialogRef<any>,
    ) {

    }

    ngOnInit(): void {
        this.loadVideo(this.data);
    }

    private loadVideo(url: any) {
        let hls = new Hls();

        hls.loadSource(url);
        hls.attachMedia(this.videoPlayer.nativeElement);
        hls.on(Hls.Events.MANIFEST_PARSED, this.onManifestParsed.bind(this));

        this.videoPlayer.nativeElement.hidden = false;
    }

    private onManifestParsed(event: string, data: Hls.mediaAttachedData) {
        //this.video.nativeElement.play();
    }
}

