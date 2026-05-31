import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}) => children,
  createNavigationContainerRef: () => ({
    current: null,
    canGoBack: () => false,
    isReady: () => false,
    navigate: jest.fn(),
    dispatch: jest.fn(),
    getRootState: jest.fn(),
  }),
  StackActions: {
    replace: jest.fn(),
    popToTop: jest.fn(),
  },
}));

jest.mock('@react-navigation/stack', () => ({
  CardStyleInterpolators: {forHorizontalIOS: 'forHorizontalIOS'},
  createStackNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({bottom: 0}),
  SafeAreaView: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
