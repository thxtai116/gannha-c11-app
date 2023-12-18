import { Injectable } from "@angular/core";

import { BehaviorSubject } from "rxjs";

@Injectable()

export class TenantsState {
    authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}