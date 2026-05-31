import {useState} from 'react';
import {Alert} from 'react-native';
import {ISiginInProps} from './signin.props';
import {AuthService} from '../../services/auth.service';

export const useSignin = (): ISiginInProps => {
  const [isSecure, setIsSecure] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      const res = await AuthService.login(email.trim(), password);
      Alert.alert('Welcome back', `Logged in as ${res.user?.full_name ?? email}.`);
    } catch (err) {
      Alert.alert('Login failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    isSecure,
    setIsSecure,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    onSignin,
  };
};
