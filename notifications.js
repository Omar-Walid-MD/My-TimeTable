import notifee, { TimestampTrigger, TriggerType, TimeUnit, RepeatFrequency, AndroidImportance } from "@notifee/react-native";
import * as Device from 'expo-device';
// const dayStrings = ["sun","mon","tue","wed","thu","fri","sat"];

function getFirstTimeStamp(period)
{
	let timeStamp = new Date();
	timeStamp.setHours(parseInt(period.from.split(":")[0]));
	timeStamp.setMinutes(parseInt(period.from.split(":")[1]));
	let periodDay = period.day>0 ? period.day-1 : 6; 
	let dayDifference = periodDay-timeStamp.getDay();
	dayDifference = dayDifference<0 ? 7+dayDifference : dayDifference;
	timeStamp.setDate(timeStamp.getDate()+dayDifference);
	return timeStamp.getTime() - 46 * 1000;
}


export async function cancelNotification(notifId){
	await notifee.cancelTriggerNotification(notifId);
	console.log("cancelled notif");
}

export async function cancelAllNotifications()
{
	await notifee.cancelAllNotifications();
}

export async function addPeriodNotification(period)
{
	const notifId = await notifee.createTriggerNotification({
		title: `(${period.title}) upcoming in 5 minutes!`,
		body: `Head to ${period.location || "the next location"} now!`,
		android: {
			channelId: "periodNotif",
			sound: "default",
			// smallIcon:"notif_icon"
		}
	},
	{
		type:TriggerType.TIMESTAMP,
		repeatFrequency: RepeatFrequency.WEEKLY,
		timestamp: getFirstTimeStamp(period)
	})
	
	console.log(new Date(getFirstTimeStamp(period)))
	console.log("added notif"); 
	return notifId;
}

export async function editPeriodNotification(period)
{
	cancelNotification(period.notifId);
	const id = await addPeriodNotification(period);
	return id;
}





