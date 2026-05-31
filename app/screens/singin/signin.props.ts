export interface ISiginInProps {
  isSecure: boolean;
  setIsSecure: (e: boolean) => void;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (e: string) => void;
  loading: boolean;
  onSignin: () => void;
}
