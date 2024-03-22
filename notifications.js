import notifee, { TimestampTrigger, TriggerType, TimeUnit, RepeatFrequency, AndroidImportance, AlarmType } from "@notifee/react-native";
import * as Device from 'expo-device';
// const dayStrings = ["sun","mon","tue","wed","thu","fri","sat"];

function getFirstTimeStamp(period,before)
{
	let timeStamp = new Date();
	timeStamp.setHours(parseInt(period.from.split(":")[0]));
	timeStamp.setMinutes(parseInt(period.from.split(":")[1]));
	let periodDay = period.day>0 ? period.day-1 : 6; 
	let dayDifference = periodDay-timeStamp.getDay();
	dayDifference = dayDifference<0 ? 7+dayDifference : dayDifference;
	timeStamp.setDate(timeStamp.getDate()+dayDifference);
	timeStamp.setTime(timeStamp.getTime() - before*60*1000);
	if(timeStamp.getTime() <= Date.now())
	{
		timeStamp.setTime(timeStamp.getTime() + 7 * 24 * 60 * 60 * 1000);
	}
	return timeStamp.getTime();
}


export async function cancelNotification(notifId){
	await notifee.cancelTriggerNotification(notifId);
	console.log("cancelled notif");
}

export async function cancelAllNotifications()
{
	await notifee.cancelAllNotifications();
}

export async function addPeriodNotification(period,before,tr)
{
	const notifId = await notifee.createTriggerNotification({
		title: `(${period.title}) ${before ? `${tr["a"]} ${before} ${tr["b"]}` : `${tr["c"]}`}!`,
		body: `${tr["d"]} ${period.location || `${tr["e"]}`} ${tr["f"]}!`,
		android: {
			channelId: "periodNotif",
			sound: "default",
			smallIcon:"notif_icon",
			color: "green",
			pressAction: {
				id: "default"
			}
		}
	},
	{
		type:TriggerType.TIMESTAMP,
		repeatFrequency: RepeatFrequency.WEEKLY,
		timestamp: getFirstTimeStamp(period,before),
		alarmManager: {
			type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE
		}
	})
	
	// console.log("added notif at ",new Date(getFirstTimeStamp(period,before))); 
	return notifId;
}

export async function editPeriodNotification(period,before,tr)
{
	cancelNotification(period.notifId);
	const id = await addPeriodNotification(period,before,tr);
	return id;
}





