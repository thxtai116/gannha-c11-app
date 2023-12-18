import { Component, ChangeDetectionStrategy, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'm-images-preview-slider',
    templateUrl: 'images-preview-slider.component.html',
    styleUrls: ['images-preview-slider.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagesPreviewSliderComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
    }

    sliderArray: any[] = [];
    selectedIndex = 0;

    constructor(
        private _dialogRef: MatDialogRef<ImagesPreviewSliderComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
    }

    ngOnInit(): void {
        this.parseInjectionData(this.data);
    }

    private parseInjectionData(data: any) {
        for (let image of data.images) {
            this.sliderArray.push({ 'url': image.Url });
        }
        this.selectedIndex = data.selectedImage.Order;
    }

    close() {
        this._dialogRef.close();
    }

    onNextClicked() {
        if (this.selectedIndex == this.sliderArray.length - 1) {
            this.selectedIndex = 0; ``
        } else {
            this.selectedIndex++;
        }
    }

    onPreviousClicked() {
        if (this.selectedIndex == 0) {
            this.selectedIndex = this.sliderArray.length - 1;
        } else {
            this.selectedIndex--;
        }
    }
}