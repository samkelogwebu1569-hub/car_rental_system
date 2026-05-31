import {Image, ImageBackground, Pressable, Text, View} from 'react-native';
import assets from '../../assets';
import {createStyles} from './onboarding.styles';

const OnBoardingScreen = ({navigation}: {navigation: any}) => {
  const styles = createStyles();
  const {logo, overlayBg, whiteCar} = assets;

  return (
    <ImageBackground
      resizeMode="cover"
      source={whiteCar}
      style={styles.container}>
      <ImageBackground
        resizeMode="cover"
        source={overlayBg}
        style={styles.overLay}>
        <View>
          <View style={styles.logoContainer}>
            <Image resizeMode="contain" source={logo} style={styles.carLogo} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.title}>Qent</Text>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('OnBoardingScreenTwo')}
          style={styles.buttonStyle}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </ImageBackground>
    </ImageBackground>
  );
};

export default OnBoardingScreen;
