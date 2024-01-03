export type LoginDto = {
  id: number;
  name: string;
  password: string;
  remember: boolean;
  code?: string;
};
export type LoginResponseDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  access_token: string;
  status?: "ACTIVE" | "ONBOARD";
};

export type RegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  code?: string;
};
export type ForgotPasswordDto = {
  email: string;
};
export type ResetPasswordDto = {
  password: string;
  confirmPassword: string;
};
