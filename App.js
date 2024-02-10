import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './StackNavigator/StackNavigator';
import { Provider, useDispatch } from 'react-redux';
import store from './Store/store';

import styles from './styles';
import { getTables } from './Store/slice/slice';

export default function App() {

	return (
		<Provider store={store}>
			<NavigationContainer style={styles.container}>
				<StackNavigator />
			</NavigationContainer>
		</Provider>
	);
}
 
