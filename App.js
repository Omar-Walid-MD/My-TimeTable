import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './Navigator/Navigator';
import { Provider, useDispatch } from 'react-redux';
import store from './Store/store';
import { I18nManager } from "react-native";
import * as ScreenOrientation from 'expo-screen-orientation';

import styles from './styles';

export default function App() {

	ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

	return (
		<Provider store={store}>
			<NavigationContainer style={styles.container}>
				<Navigator />
			</NavigationContainer>
		</Provider>
	);
}
 
