import { createParamDecorator } from '@nestjs/common';

/**
 * Decorator used to intercept the request an get the user that's stored
 * in the request object. This will return the user that made such request
 */
export const CurrentUser = createParamDecorator(
  (data, req) => req.args[0].user,
);
