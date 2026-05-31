import {Platform} from 'react-native';

/**
 * Base URL of the PHP (XAMPP) backend API.
 *
 * Android emulators reach the host machine on 10.0.2.2, while the iOS
 * simulator can use localhost. Override API_HOST for a physical device by
 * pointing it at your machine's LAN IP (e.g. 192.168.x.x).
 */
const API_HOST = Platform.select({android: '10.0.2.2', default: 'localhost'});

export const API_BASE_URL = `http://${API_HOST}/car_rental_api`;
