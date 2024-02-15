import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from './Navigator/Navigator';
import { Provider, useDispatch } from 'react-redux';
import store from './Store/store';
import * as Notifications from "expo-notifications";
import { I18nManager } from "react-native";

import styles from './styles';
import { getTables } from './Store/slice/slice';
import { useEffect, useRef, useState } from 'react';
import { registerForPushNotificationsAsync } from './notifications';


Notifications.setNotificationHandler({
handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

function getTimestampAtHour(hourString)
{
	let d = new Date();
	d.setHours(0,0,0,0);
	d.setHours(d.getHours()-d.getTimezoneOffset()/60+parseInt(hourString.split(":")[0]),parseInt(hourString.split(":")[1]))
	// console.log(d);
	return d.getTime();
}

export default function App() {

	const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

	// I18nManager.forceRTL(false);
	// I18nManager.allowRTL(false);

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        	setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        });

        return () => {
			Notifications.removeNotificationSubscription(notificationListener.current);
			Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

	return (
		<Provider store={store}>
			<NavigationContainer style={styles.container}>
				<Navigator />
			</NavigationContainer>
		</Provider>
	);
}
 
