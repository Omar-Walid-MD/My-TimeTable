import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import styles from '../styles';
import NavBar from '../Components/Navbar';
import { useSelector } from 'react-redux';
import store from '../Store/store';
import { useEffect, useState } from 'react';

export default function HomeScreen({navigation}) {

    const tables = useSelector(store => store.tables.tables);
    const currentTable = useSelector(store => store.tables.currentTable);
    
    const dayStrings = ["sun","mon","tue","wed","thu","fri","sat"]
    let day = dayStrings[new Date().getDay()];
    // day = "sat";

    const [periods,setPeriods] = useState([]);
    
    // console.log(tables);
    
    useEffect(()=>{
        if(tables)
        {
            setPeriods(day!=="fri" ? tables[currentTable].content[day] : [])
        }
    },[tables])

    return (
        <View style={styles.pageContainer}>
            <NavBar navigation={navigation} />


            <Text style={{fontSize:20,marginTop:30}}>Today</Text>
            <View style={{width:"100%",marginTop:10,paddingHorizontal:20}}>
                <View style={{width:"100%",height:2.5,backgroundColor:"black"}}></View>
            </View>
            <ScrollView style={{width:"100%"}} contentContainerStyle={{flexGrow: 1,alignItems:"center",gap:20,padding:20}}>
            {
                periods.length ? periods.map((period,index) =>
                <View key={`period-${index}`} style={{backgroundColor:"#E6FFE6",padding:20,alignItems:"center",width:"100%",borderRadius:10,shadowColor:"black",elevation:5}}>
                    <Text style={{fontSize:25}}>{period.time}</Text>
                    <Text style={{fontSize:25,marginBottom:20,textAlign:"center",textTransform:"capitalize"}}>{period.title}</Text>
                    <View style={{flexDirection:"column",width:"100%"}}>
                        <Text style={{fontSize:20,color:"#647864",textTransform:"capitalize"}}>At: {period.location}</Text>
                        <Text style={{fontSize:20,color:"#87A087",textTransform:"capitalize"}}>By: {period.instructor}</Text>
                    </View>
                </View>
                )
                :
                <Text style={{fontSize:40}}>No Periods Today.</Text>
            }
            </ScrollView>
            
            <StatusBar style="auto" />
        </View>
    );
}
 
