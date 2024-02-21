import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView, Platform, PermissionsAndroid } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import themes from '../themes';
import NavBar from '../Components/Navbar';
import { useSelector } from 'react-redux';
import store from '../Store/store';
import { useEffect, useState } from 'react';
import notifee, { TimestampTrigger, TriggerType, TimeUnit, RepeatFrequency, AndroidImportance } from "@notifee/react-native";


export default function HomeScreen({navigation}) {

    
    const styles = useSelector(store => store.theme.styles);
    const currentTheme = useSelector(store => store.theme.theme);

    const tables = useSelector(store => store.tables.tables);
    const currentTable = useSelector(store => store.tables.currentTable);
    
    const dayStrings = ["sun","mon","tue","wed","thu","fri","sat"];
    let day = dayStrings[new Date().getDay()];
    // day = "sat";
    
    const [periods,setPeriods] = useState([]);
    const [currentPeriod,setCurrentPeriod] = useState(null);

    function getTimestampAtHour(hourString)
    {
        let d = new Date();
        d.setHours(0,0,0,0);
        d.setHours(d.getHours()+parseInt(hourString.split(":")[0]),parseInt(hourString.split(":")[1]))
        return d.getTime();
    }

    function getTimeString(hourString)
    {
        if(!hourString) return "00:00";

        let h = parseInt(hourString.split(":")[0]);
        let m = parseInt(hourString.split(":")[1]);
        let t = h < 12 ? "AM" : "PM";
        
        if(t==="AM")
        {
            if(h===0) h = 12;
        }
        else
        {
            if(h!==12) h %= 12;
        }

        return `${h}:${m<10 ? "0"+m : m} ${t}`;
    }

    function getCurrentPeriod(periods)
    {
        if(periods.length)
        {
            let currentTime = Date.now();
            for(let i = 0; i < periods.length; i++)
            {
                let periodEndTime = getTimestampAtHour(periods[i].to);

                if(currentTime < periodEndTime) return i;
            }
        }
        return null;
    }

    async function displayNotification()
    {
       
    }
    
    useEffect(()=>{
        if(tables)
        {
            let p = day!=="fri" ? tables[currentTable].content[day] : []
            setPeriods(p);
            setCurrentPeriod(getCurrentPeriod(p));
        }
    },[tables]);

    return (
        <View style={styles.pageContainer}>
            {/* <Pressable onPress={()=>{displayNotification()}}>
                <Text>Press For NOTIF</Text>
            </Pressable> */}
            <Text style={{...styles.text,fontSize:20,marginTop:30,marginBottom:15}}>Today</Text>
            <ScrollView style={{width:"100%"}} contentContainerStyle={{flexGrow: 1,alignItems:"center",gap:20,padding:20}}>
            {
                periods.length ? periods.map((period,index) =>
                <View key={`period-${index}`} style={{backgroundColor:themes[currentTheme]["period-home"],padding:20,alignItems:"center",width:"100%",borderRadius:10,shadowColor:"black",elevation:5,"transform": `scale(${index===currentPeriod ? 1.05 : 1})`,borderWidth:index===currentPeriod ? 3 : 0,borderColor:themes[currentTheme]["faint-2"]}}>
                    <Text style={{fontSize:15,color:themes[currentTheme]["faint"]}}>{getTimeString(period.from)} - {getTimeString(period.to)}</Text>
                    <Text style={{...styles.text,fontSize:25,marginBottom:20,textAlign:"center",textTransform:"capitalize"}}>{period.title}</Text>
                    <View style={{flexDirection:"column",width:"100%"}}>
                        {period.location && <Text style={{fontSize:20,color:themes[currentTheme]["faint-2"],textTransform:"capitalize"}}>At: {period.location}</Text>}
                        {period.instructor && <Text style={{fontSize:20,color:themes[currentTheme]["faint"],textTransform:"capitalize"}}>By: {period.instructor}</Text>}
                        
                    </View>
                    <View style={{position:"absolute",top:0,left:0,margin:5,borderRadius:5,backgroundColor:themes[currentTheme]["faint"],height:25,aspectRatio:1,alignContent:"center",alignItems:"center"}}>
                        <Text style={{color:themes[currentTheme]["period-home"],fontWeight:"bold"}}>{index+1}</Text>
                    </View>
                </View>
                )
                :
                <Text style={{...styles.text,fontSize:40,textAlign:"center"}}>No Periods Today.</Text>
            }
            </ScrollView>
            
            <StatusBar style="auto" />
        </View>
    );
}
 
