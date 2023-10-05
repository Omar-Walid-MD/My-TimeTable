import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './StackNavigator/StackNavigator';
import { Provider } from 'react-redux';
import store from './Store/store';

import styles from './styles';

export default function App() {
  return (
	<Provider store={store}>
		<NavigationContainer style={styles.container}>
			<StackNavigator />
		</NavigationContainer>
	</Provider>
  );
}
 
