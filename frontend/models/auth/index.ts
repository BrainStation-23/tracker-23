export type LoginDto = {
  name: string;
  password: string;
};
export type LoginResponseDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  access_token: string;
};

export type RegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
