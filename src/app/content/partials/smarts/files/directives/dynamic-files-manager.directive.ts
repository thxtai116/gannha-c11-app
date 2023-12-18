import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[dynamic-files-manager]'
})
export class DynamicFilesManagerDirective {
    constructor(public viewContainer: ViewContainerRef) { }
}
