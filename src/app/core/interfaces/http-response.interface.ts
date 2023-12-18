export interface HttpResponseInterface {
    successful: boolean;
    errorDescription: string;
    errorCode: number;
    data: any;
}