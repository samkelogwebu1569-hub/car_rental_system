module.exports = {
  preset: 'react-native',
  testPathIgnorePatterns: ['/node_modules/', '/car-app/'],
  modulePathIgnorePatterns: ['<rootDir>/car-app/'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-safe-area-context|react-native-vector-icons)/)',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
