import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, View, Image, Pressable, ScrollView, Platform, PermissionsAndroid } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Octicons } from 'react-native-vector-icons'
import themes from '../themes';
import NavBar from '../Components/Navbar';
import { useSelector } from 'react-redux';
import store from '../Store/store';
import { useEffect, useState } from 'react';
import * as Localization from "expo-localization";
import Text from '../Components/Text';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function HomeScreen({navigation}) {

    const { t } = useTranslation();
    
    const styles = useSelector(store => store.settings.styles);

    const tables = useSelector(store => store.tables.tables);
    const currentTable = useSelector(store => store.tables.currentTable);

    let day = 0;//(new Date().getDay() + 1) % 7;
    
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
            let currentTime = Date.now() - 5 * 3600 * 1000;
            for(let i = 0; i < periods.length; i++)
            {
                let periodEndTime = getTimestampAtHour(periods[i].to);

                if(currentTime < periodEndTime) return i;
            }
        }
        return null;
    }
    
    useEffect(()=>{
        if(tables && currentTable!==null)
        {
            let p = day!==6 ? tables[currentTable].content[day] : [];
            setPeriods(p);
            setCurrentPeriod(getCurrentPeriod(p));
        }
    },[tables, currentTable]);

    return (
        <View style={styles["page-container"]}>

            <Text weight='b'
            //style[text col-dark fontSize:20 marginTop:25 marginBottom:10]
            style={{...styles['text'],...styles['col-dark'],fontSize:20,marginTop:25,marginBottom:10}}>
            {t(`days.${day}`)}</Text>

            <ScrollView style={{width:"100%"}} contentContainerStyle={{flexGrow: 1,alignItems:"center",gap:20,padding:20}}>
            {
                periods.length ? periods.map((period,index) =>
                <View key={`period-${index}`}
                style={{...styles["home-period-container"],"transform": `scale(${index===currentPeriod ? 1.05 : 1})`,borderWidth:index===currentPeriod ? 3 : 0}}>

                    <View style={{flexDirection: i18n.language==="ar" ? "row-reverse" : "row",alignItems:"center",gap:5,marginBottom:5}}>
                        <Text style={{...styles["color-faint"],fontSize:15}}>{getTimeString(period.to)}</Text>
                        <Octicons name="triangle-left" size={30} style={{...styles["color-faint-2"],marginHorizontal:2.5,transform:[{scaleX: i18n.language==="ar" ? 1 : -1}]}} />
                        <Text style={{...styles["color-faint"],fontSize:15}}>{getTimeString(period.from)}</Text>
                        <MaterialCommunityIcons name="clock" size={25} style={{...styles["color-faint-2"]}} />
                    </View>
                    <Text style={{fontSize:25,marginBottom:20,textAlign:"center",textTransform:"capitalize"}}>{period.title}</Text>
                    <View style={{flexDirection:"column",width:"100%",alignItems:"flex-start"}}>
                    {
                        period.location &&
                        <View
                        style={{flexDirection: i18n.language==="ar" ? "row-reverse" : "row",alignItems:"center",gap:5}}
                        >
                            <Text style={{...styles.text,...styles["color-faint-2"],fontSize:15,textTransform:"capitalize",textAlign:"center"}}>{period.location}</Text>
                            <MaterialIcons name="location-on" size={25} style={{...styles["color-faint-2"]}} />
                        </View>
                    }
                    {
                        period.instructor &&
                        <View
                        style={{flexDirection: i18n.language==="ar" ? "row-reverse" : "row",alignItems:"center",gap:5}}
                        >
                            <Text style={{...styles.text,...styles["color-faint-2"],fontSize:15,textTransform:"capitalize",textAlign:"center"}}>{period.instructor}</Text>
                            <MaterialIcons name="person" size={25} style={{...styles["color-faint-2"]}} />
                        </View>
                    }                        
                    </View>
                    <View style={{...styles["bg-faint"],position:"absolute",top:-15,left:-15,margin:5,borderRadius:5,height:30,aspectRatio:1,justifyContent:"center",alignItems:"center",shadowColor:"black",elevation:5}}>
                        <Text weight='b' style={{...styles["color-period-home"],fontSize:17.5}}>{index+1}</Text>
                    </View>
                </View>
                )
                :
                <Text style={{...styles["text"],fontSize:30,textAlign:"center"}}>{t("home.no-periods")}</Text>
            }
            </ScrollView>
            
            <StatusBar style="auto" />
        </View>
    );
}
 
