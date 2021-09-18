export class PaginationDto<Type> {
  skip: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
  records: Type[];
}
