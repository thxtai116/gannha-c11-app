import { CloudBlobType } from "../enums/index";

export class IconViewModel {
    
    Type: CloudBlobType = CloudBlobType.BlobBlock;

    Name: string = "";

    Url: string = "";

    Parent: string = "";
}