import { ValidatorFn, AbstractControl } from "@angular/forms";

export class ValidAddressContact {

	static validate(): ValidatorFn {

		return (control: AbstractControl): { [key: string]: any } => {
			let value: any = control.value;

			if (value && value.Administration) {
				if (!value.Administration["2"] || value.Administration["2"].length == 0) {
					return { "validAdministration": true }
				}
				if (!value.Administration["4"] || value.Administration["4"].length == 0) {
					return { "validAdministration": true }
				}
				if (!value.Administration["6"] || value.Administration["6"].length == 0) {
					return { "validAdministration": true }
				}
				if (!value.Administration["8"] || value.Administration["8"].length == 0) {
					return { "validAdministration": true }
				}
				if (!value.Street || !value.Street["vi"] || value.Street["vi"].length == 0) {
					return { "validStreet": true }
				}
			} else {
				return { "wrongValueType": true };
			}

			return null;
		}
	}
}