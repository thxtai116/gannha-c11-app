import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgControl } from '@angular/forms';

@Component({
    selector: 'm-error-parser',
    templateUrl: './error-parser.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorParserComponent implements OnInit {

    @Input() ngControl: NgControl;

    errors: string[] = [];

    ngOnInit(): void {
        if (this.ngControl.errors) {
            this.errors = Object.keys(this.ngControl.errors);
        }
    }
}
