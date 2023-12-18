import { ValidatorFn, AbstractControl } from "@angular/forms";

export class MaxCharacters {
	static validate(number: number): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } => {
			let value: string = control.value;
			if (value) {
                return (value.length > number) ? { "maxCharacters": true } : null;
			}
			return null;
		};
	}
}
