import {useState} from 'react';
import {Alert} from 'react-native';
import {ISignUpProps} from './signup.props';
import {AuthService} from '../../services/auth.service';
import {navigate} from '../../navigators/navigation-utilities';

export const useSignup = (): ISignUpProps => {
  const [isSecure, setIsSecure] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your name, email and password.');
      return;
    }
    try {
      setLoading(true);
      const res = await AuthService.register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        country: country.trim() || undefined,
      });
      Alert.alert(
        'Account created',
        res.otp
          ? `Enter the verification code: ${res.otp}`
          : 'Enter the verification code we sent you.',
      );
      navigate('OtpScreen', {email: email.trim()});
    } catch (err) {
      Alert.alert('Sign up failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    isSecure,
    setIsSecure,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    country,
    setCountry,
    loading,
    onSignUp,
  };
};
