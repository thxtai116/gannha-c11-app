import { CloudBlobType } from "../enums/index";

export class Blob {
    Type: CloudBlobType = CloudBlobType.BlobBlock;

    Name: string = "";

    Url: string = "";

    Parent: string = "";
}