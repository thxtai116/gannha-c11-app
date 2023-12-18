import { Component, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, OnInit } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../../../environments/environment'

@Component({
    selector: 'm-selling-point-embryo',
    templateUrl: 'selling-point-embryo.component.html',
    styleUrls: ['selling-point-embryo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SellingPointEmbryoComponent),
            multi: true,
        }
    ]
})
export class SellingPointEmbryoComponent implements OnInit, ControlValueAccessor {
    @ViewChild('spLogo', { static: true }) logo: ElementRef;

    private _onChangeCallback = (value: any) => { };

    storageEndPoint = environment.storageEndpoint;

    spPreview: any = {
        Type: "",
        DateRanges: [],
        TimeRanges: [],
        SellingPointTitle: "",
        SellingPointDescription: "",
        Backgrounds: [],
        ActionButton: "",
    };

    displayBackground: string = "/assets/app/media/img/bg/bg-3.jpg";
    defaultBackground: string = "/assets/app/media/img/bg/bg-3.jpg";

    displayLogo: string = "/assets/app/media/img/default_user.jpg";
    defaultLogo: string = "/assets/app/media/img/default_user.jpg";

    displayType: string = this._translate.instant("SELLING_POINT_PREVIEW.TYPE");

    constructor(
        private _translate: TranslateService,
        private _changeRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.bindEvents();
    }

    writeValue(obj: any): void {
        if (obj) {
            this.spPreview = obj;

            if (obj.Backgrounds && obj.Backgrounds.length > 0) {
                for (let bg of obj.Backgrounds) {
                    if (bg && bg.Url.length > 0) {
                        this.displayBackground = bg.Url;
                        break;
                    }
                }
            } else {
                this.displayBackground = this.defaultBackground;
            }

            if (obj.Type && obj.Type.length > 0) {
                this.displayLogo = this.storageEndPoint + obj.Type[0].id + ".png";
                this.displayType = obj.Type[0].text;
            } else {
                this.displayLogo = this.defaultLogo;
                this.displayType = this._translate.instant("SELLING_POINT_PREVIEW.TYPE");
            }

            this._changeRef.detectChanges();
        }
    }
    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    private bindEvents() {
        this.logo.nativeElement.addEventListener('error', () => {
            this.displayLogo = this.defaultLogo;
            this._changeRef.detectChanges();
        })
    }
}