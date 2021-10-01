export const USER_ITEM_LIST_SELECT = {
  firstName: 1,
  lastName: 1,
  username: 1,
  email: 1,
  status: 1,
  roles: 1,
  createdOn: 1,
};

export const USER_SUBDOC_SELECT = {
  username: 1,
};

export const USER_PROFILE_SELECT = {
  firstName: 1,
  lastName: 1,
  username: 1,
  email: 1,
  avatar: 1,
  roles: 1,
  company: 1,
};

export const COMPANY_SUBDOC_SELECT = {
  name: 1,
  logo: 1,
};

export const BRANCH_ITEM_LIST_SELECT = {
  name: 1,
  status: 1,
  createdOn: 1,
  company: 1,
};

export const EMPLOYEE_LIST_SELECT = {
  _id: '$user._id',
  firstName: '$user.firstName',
  lastName: '$user.lastName',
  username: '$user.username',
  email: '$user.email',
  status: '$user.status',
  employeeType: 1,
};

export const CONTACT_LIST_SELECT = {
  _id: '$user._id',
  firstName: '$user.firstName',
  lastName: '$user.lastName',
  username: '$user.username',
  employeeType: 1,
};
