import { Component, ChangeDetectionStrategy, forwardRef, Input, ChangeDetectorRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
    selector: 'm-brand-embryo',
    templateUrl: 'brand-embryo.component.html',
    styleUrls: ['./brand-embryo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BrandEmbryoComponent),
            multi: true,
        }
    ]
})
export class BrandEmbryoComponent implements ControlValueAccessor {

    @Input() fullPreview: boolean = true;

    brandPreview: any = {
        Name: "",
        Slogan: "",
        SellingPointTitle: "",
        SellingPointDescription: "",
        Backgrounds: [],
        Share: {},
        Appointment: {},
    };

    displayBackground: string = "/assets/app/media/img/bg/bg-3.jpg";
    defaultBackground: string = "/assets/app/media/img/bg/bg-3.jpg";

    lang: string = "vi";

    constructor(
        private _changeRef: ChangeDetectorRef,
    ) { }

    writeValue(obj: any): void {
        if (obj) {
            this.brandPreview = obj;

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

            this._changeRef.detectChanges();
        }
    }

    registerOnChange(fn: any): void { }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }
}