export interface ISignUpProps {
  isSecure: boolean;
  setIsSecure: (e: boolean) => void;
  fullName: string;
  setFullName: (e: string) => void;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (e: string) => void;
  country: string;
  setCountry: (e: string) => void;
  loading: boolean;
  onSignUp: () => void;
}
