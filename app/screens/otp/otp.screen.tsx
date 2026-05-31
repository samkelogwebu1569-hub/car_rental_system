import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {Alert, Image, Text, View} from 'react-native';
import assets from '../../assets';
import Button from '../../components/button/component';
import OtpComponent from '../../components/otp/component';
import {NavigatorParamList} from '../../navigators/navigation-route';
import {navigate} from '../../navigators/navigation-utilities';
import {AuthService} from '../../services/auth.service';
import {renderMarginTop} from '../../utils/ui-utils';
import {createStyles} from './otp.styles';

const OtpScreen = () => {
  const styles = createStyles();
  const {logo_black} = assets;
  const route = useRoute<RouteProp<NavigatorParamList, 'OtpScreen'>>();
  const email = route.params?.email ?? '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    if (code.length < 4) {
      Alert.alert('Invalid code', 'Please enter the 4-digit verification code.');
      return;
    }
    try {
      setLoading(true);
      await AuthService.verifyOtp(email, code);
      Alert.alert('Verified', 'Your account has been verified. Please sign in.');
      navigate('SignInScreen');
    } catch (err) {
      Alert.alert('Verification failed', (err as Error).message);
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
              Enter verification code
            </Text>
            {renderMarginTop(12)}
            <Text style={styles.infoText}>
              We have sent a code to : {email || 'your account'}
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <OtpComponent onOTPChange={setCode} />
          </View>
          {renderMarginTop(28)}
          <Button
            onPress={onContinue}
            text={loading ? 'Please wait...' : 'Continue'}
            textStyles={styles.buttonText}
          />
          {renderMarginTop(28)}
          <Text
            onPress={() => navigate('SignInScreen')}
            style={[styles.dontHaveText, styles.textCenter]}>
            Didn’t receive the OTP ? <Text>Resend</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OtpScreen;
