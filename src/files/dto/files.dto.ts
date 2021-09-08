import { CollectionTypes, ResourceTypes } from '../schemas/file.schema';

export class UploadFileDto {
  collectionType: CollectionTypes;
  resourceType: ResourceTypes;
  documentId: string;
}
