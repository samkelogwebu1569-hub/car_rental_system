import React, {useState} from 'react';
import {Alert, Image, Text, View} from 'react-native';
import assets from '../../assets';
import {createStyles} from './reset.styles';
import {renderMarginBottom, renderMarginTop} from '../../utils/ui-utils';
import InputComponent from '../../components/input/component';
import Button from '../../components/button/component';
import {goBack, navigate} from '../../navigators/navigation-utilities';
import {AuthService} from '../../services/auth.service';

const ResetScreen = () => {
  const styles = createStyles();
  const {logo_black} = assets;

  // Two-step flow: request a reset code, then set a new password with it.
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRequest = async () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }
    try {
      setLoading(true);
      const res = await AuthService.requestReset(email.trim());
      Alert.alert(
        'Reset code sent',
        res.otp ? `Your reset code is: ${res.otp}` : 'Check your inbox for the code.',
      );
      setStep('reset');
    } catch (err) {
      Alert.alert('Request failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onReset = async () => {
    if (code.length < 4 || password.length < 6) {
      Alert.alert(
        'Invalid input',
        'Enter the 4-digit code and a password of at least 6 characters.',
      );
      return;
    }
    try {
      setLoading(true);
      await AuthService.resetPassword(email.trim(), code, password);
      Alert.alert('Password updated', 'You can now sign in with your new password.');
      navigate('SignInScreen');
    } catch (err) {
      Alert.alert('Reset failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.flex}>
        <View style={styles.flexRow}>
          <Image source={logo_black} style={styles.carLogo} />
          <Text style={styles.titleStyle}>Qent</Text>
        </View>
        <View style={styles.main}>
          <View style={styles.textContainer}>
            <Text style={[styles.textStyle, styles.textCenter]}>
              Reset your password
            </Text>
            {renderMarginTop(12)}
            <Text style={styles.infoText}>
              {step === 'request'
                ? 'Enter the email associated with your account and we’ll send you a reset code.'
                : 'Enter the code we sent and choose a new password.'}
            </Text>
          </View>
          <View style={styles.inputContainer}>
            {step === 'request' ? (
              <InputComponent
                onChangeText={setEmail}
                placeholder={'Email'}
                keyboardType={'email-address'}
              />
            ) : (
              <>
                <InputComponent
                  onChangeText={setCode}
                  placeholder={'Reset code'}
                  keyboardType={'number-pad'}
                />
                <InputComponent
                  isSecure
                  secureTextEntry
                  onChangeText={setPassword}
                  placeholder={'New password'}
                />
              </>
            )}
          </View>
          {renderMarginTop(28)}
          <Button
            onPress={step === 'request' ? onRequest : onReset}
            text={
              loading
                ? 'Please wait...'
                : step === 'request'
                ? 'Continue'
                : 'Reset password'
            }
            textStyles={styles.buttonText}
          />
          {renderMarginTop(28)}
          <Text
            onPress={() => navigate('SignInScreen')}
            style={[styles.dontHaveText, styles.textCenter]}>
            Return to sign in
          </Text>
        </View>
      </View>
      <Text onPress={goBack} style={[styles.dontHaveText, styles.textCenter]}>
        Create a New account{' '}
      </Text>
      {renderMarginBottom(32)}
    </View>
  );
};

export default ResetScreen;
