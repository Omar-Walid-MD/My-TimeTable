import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './Navigator/Navigator';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './Store/store';
import * as ScreenOrientation from 'expo-screen-orientation';

import styles from './styles';

import { Cairo_400Regular as Cairo,Cairo_600SemiBold as Cairo_sb, Cairo_700Bold as Cairo_b } from '@expo-google-fonts/cairo';
import { Ubuntu_400Regular as Ubuntu, Ubuntu_500Medium as Ubuntu_sb, Ubuntu_700Bold as Ubuntu_b} from "@expo-google-fonts/ubuntu";
import { useFonts } from 'expo-font';
import { cancelAllNotifications } from './notifications';


export default function App() {

	ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
	
	let [fontsLoaded] = useFonts({
		Cairo, Cairo_sb, Cairo_b,
		Ubuntu, Ubuntu_sb, Ubuntu_b
	});

	if (!fontsLoaded) {
		return null;
	}

	// cancelAllNotifications();
	

	return (
		<Provider store={store}>
			<NavigationContainer style={styles.container}>
				<Navigator />
			</NavigationContainer>
		</Provider>
	);
}


// i18n.fallbacks = true

// i18n.translations = {
//   en: translationEN,
//   ar: translationAR
// }
