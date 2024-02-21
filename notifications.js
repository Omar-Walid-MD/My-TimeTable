import notifee from "@notifee/react-native";
import * as Device from 'expo-device';
// const dayStrings = ["sun","mon","tue","wed","thu","fri","sat"];

export async function registerForPushNotificationsAsync() {
	let token;
	
	if (Device.isDevice) {
		const { status: existingStatus } =
		await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
		}
		if (finalStatus !== "granted") {
		// alert("Failed to get push token for push notification!");
		return;
		}
		token = (await Notifications.getExpoPushTokenAsync({
			'projectId': "3877a72b-c672-412e-8b07-a1a63ef9dcf0"
		})).data;
	//   console.log(token);
	} else {
		// alert("Must use physical device for Push Notifications");
	}
	
	if (Platform.OS === "android") {
		Notifications.setNotificationChannelAsync("default", {
		name: "default",
		importance: Notifications.AndroidImportance.MAX,
		vibrationPattern: [0, 250, 250, 250],
		sound: true,
		lightColor: "#FF231F7C",
		lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
		bypassDnd: true,
		});
	}
	
	return token;
}

export async function cancelNotification(notifId){
	await Notifications.cancelScheduledNotificationAsync(notifId);
	console.log("cancelled notif");
}

export async function cancelAllNotifications()
{
	await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function addPeriodNotification(period)
{
	const notifId = await Notifications.scheduleNotificationAsync({
        content: {
        title: `(${period.title}) upcoming in 5 minutes!`,
        body: `Head to ${period.location || "the next location"} now!`,
		
        },
        trigger: {
			weekday: period.day+1,
			hour: parseInt(period.from.split(":")[0]),
			minute: parseInt(period.from.split(":")[1]),
			repeats: true
		}
    });
	console.log("added notif"); 
	return notifId.toString();
}

export async function editPeriodNotification(period)
{
	cancelNotification(period.notifId);
	const id = await addPeriodNotification(period);
	return id;
}





