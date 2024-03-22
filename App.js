import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './Navigator/Navigator';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './Store/store';
import * as ScreenOrientation from 'expo-screen-orientation';

import styles from './styles';
import { useFonts } from 'expo-font';
import { useCallback } from 'react';

export default function App() {

	ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
	const [loaded] = useFonts({
		// "Cairo": require("./assets/fonts/Cairo-Regular.ttf"),
		// "Cairo-bold": require("./assets/fonts/Cairo-Bold.ttf"),
		"Alexandria": require("./assets/fonts/Alexandria-Regular.ttf"),
		"Alexandria-bold": require("./assets/fonts/Alexandria-Bold.ttf"),
		"Alexandria-semibold": require("./assets/fonts/Alexandria-SemiBold.ttf"),


		"NotoKufiArabic": require("./assets/fonts/NotoKufiArabic-Regular.ttf"),
		"NotoKufiArabic-bold": require("./assets/fonts/NotoKufiArabic-Bold.ttf"),
		"NotoKufiArabic-semibold": require("./assets/fonts/NotoKufiArabic-SemiBold.ttf"),

	});

	const onLayoutRootView = useCallback(async () => {
		if (loaded) {
		  await SplashScreen.hideAsync();
		}
	  }, [loaded]);

	return (
		<Provider store={store} onLayout={onLayoutRootView}>
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
