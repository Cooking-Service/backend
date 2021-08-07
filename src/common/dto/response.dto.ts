export class ResponseDto<Type> {
  success: boolean;
  message?: string;
  response?: Type;
}
