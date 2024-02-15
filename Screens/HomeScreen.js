import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import styles from '../styles';
import NavBar from '../Components/Navbar';
import { useSelector } from 'react-redux';
import store from '../Store/store';
import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as DocumentPicker from 'expo-document-picker';


export default function HomeScreen({navigation}) {

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
    
    async function chooseFile()
    {
        console.log("opened")
        let file = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory:true
        });
        console.log(file)
    }

    async function saveFile()
    {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
            return;
        }

        const base64Data = 'my base 64 data';

        try {
            let fileUri = permissions.directoryUri;
            let fileName = "text.txt"
            
            await FileSystem.StorageAccessFramework.createFileAsync(fileUri,fileName,"text/plain").then(async (newUri)=>{
                let n = await FileSystem.StorageAccessFramework.writeAsStringAsync(newUri, "Hello World");
                console.log(newUri);
                console.log("done");

            })
        } catch (e) {
            throw new Error(e);
        }

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
            <Pressable onPress={()=>saveFile()}>
                <Text>Choose</Text>
            </Pressable>
            <Text style={{fontSize:20,marginTop:30,marginBottom:15}}>Today</Text>
            <ScrollView style={{width:"100%"}} contentContainerStyle={{flexGrow: 1,alignItems:"center",gap:20,padding:20}}>
            {
                periods.length ? periods.map((period,index) =>
                <View key={`period-${index}`} style={{backgroundColor:"#E6FFE6",padding:20,alignItems:"center",width:"100%",borderRadius:10,shadowColor:"black",elevation:5,"transform": `scale(${index===currentPeriod ? 1.05 : 1})`,borderWidth:index===currentPeriod ? 3 : 0,borderColor:"#647864"}}>
                    <Text style={{fontSize:15,color:"#87A087"}}>{getTimeString(period.from)} - {getTimeString(period.to)}</Text>
                    <Text style={{fontSize:25,marginBottom:20,textAlign:"center",textTransform:"capitalize"}}>{period.title}</Text>
                    <View style={{flexDirection:"column",width:"100%"}}>
                        {period.location && <Text style={{fontSize:20,color:"#647864",textTransform:"capitalize"}}>At: {period.location}</Text>}
                        {period.instructor && <Text style={{fontSize:20,color:"#87A087",textTransform:"capitalize"}}>By: {period.instructor}</Text>}
                        
                    </View>
                    <View style={{position:"absolute",top:0,left:0,margin:5,borderRadius:5,backgroundColor:"#87A087",height:25,aspectRatio:1,alignContent:"center",alignItems:"center"}}>
                        <Text style={{color:"#E6FFE6",fontWeight:"bold"}}>{index+1}</Text>
                    </View>
                </View>
                )
                :
                <Text style={{fontSize:40,textAlign:"center"}}>No Periods Today.</Text>
            }
            </ScrollView>
            
            <StatusBar style="auto" />
        </View>
    );
}
 
