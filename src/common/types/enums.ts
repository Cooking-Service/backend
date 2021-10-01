/**
 * User Roles to Authorization and user DB-Schema.
 */
export enum UserRoles {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OBSERVER = 'OBSERVER',
  EMPLOYEE = 'EMPLOYEE',
}

/**
 * User Roles to Authentication and user DB-Schema.
 */
export enum UserStatus {
  PENDINDG = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

/**
 * Used to validate with class-validator.
 */
export enum GroupsValidation {
  PROFILE = 'PROFILE',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  FROM_BRANCH = 'FROM_BRANCH',
}

/**
 * User Employee Types to permissions.
 */
export enum EmployeeType {
  MANAGER = 'MANAGER',
  CASHER = 'CASHER',
  WAITER = 'WAITER',
  COOK = 'COOK',
}

/**
 * Global statuses to almost all DB-Schemas.
 */
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

/**
 * Name of each collection on database.
 */
export enum CollectionTypes {
  USERS = 'users',
  COMPANIES = 'companies',
}

/**
 * Used to identify file types.
 */
export enum ResourceTypes {
  AVATAR = 'avatar',
  LOGO = 'logo',
}

/**
 * Status of Report DB-Schema
 */
export enum ReportsStatuses {
  PENDING = 'PENDING',
  VIEWED = 'VIEWED',
}

/**
 * To identify Hash type on database / used on userHash DB-Schema
 */
export enum HashType {
  ACTIVE_ACCOUNT = 'ACTIVE_ACCOUNT',
  RECOVERY_PASSWORD = 'RECOVERY_PASSWORD',
}

/**
 * To use on Websocket cominitcation and employee permissions
 */
export enum OrdersStatuses {
  OPEN = 'OPEN',
  COOKING = 'COOKING',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED',
  CANCELLED = ' CANCELLED',
}
