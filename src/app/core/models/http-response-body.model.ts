import { HttpResponseErrorMessage } from "./http-response-error-message.model";

export class HttpResponseBody {
    errorCode: number;
    errorDescription: string = "";
    successful: boolean;
    errorMessage: HttpResponseErrorMessage = new HttpResponseErrorMessage();
}