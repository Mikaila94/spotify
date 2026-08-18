export {
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "./domain/schemas";

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}
