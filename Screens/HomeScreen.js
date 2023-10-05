import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import styles from '../styles';
import NavBar from '../Components/Navbar';

export default function HomeScreen({navigation}) {

    const periods = [
        {
            time: "9:00 AM",
            title: "Electronic Circuits Lec",
            location: "M11",
            instructor: "Dr. Name Name"
        },
        {
            time: "10:40 AM",
            title: "Advanced Algorithmssssss Lec",
            location: "M6",
            instructor: "Dr. Name Name"
        },
        {
            time: "12:20 PM",
            title: "Digital Electronics Tutorial",
            location: "CR2",
            instructor: "Dr. Name Name"
        },
    ]

    return (
        <View style={styles.pageContainer}>
            <NavBar navigation={navigation} />


            <Text style={{fontSize:20,marginTop:30}}>Today</Text>
            <View style={{width:"100%",marginTop:10,paddingHorizontal:20}}>
                <View style={{width:"100%",height:2.5,backgroundColor:"black"}}></View>
            </View>
            <ScrollView style={{width:"100%"}} contentContainerStyle={{alignItems:"center",gap:20,padding:20}}>
            {
                periods.map((period,index) =>
                <View key={`period-${index}`} style={{backgroundColor:"rgb(245,245,245)",padding:20,alignItems:"center",width:"100%",borderRadius:10,shadowColor:"black",elevation:5}}>
                    <Text style={{fontSize:25}}>{period.time}</Text>
                    <Text style={{fontSize:25,marginBottom:20,textAlign:"center"}}>{period.title}</Text>
                    <View style={{flexDirection:"row",justifyContent:"space-between",width:"100%"}}>
                        <Text style={{fontSize:20,color:"dimgray"}}>At: {period.location}</Text>
                        <Text style={{fontSize:20,color:"dimgray"}}>By: {period.instructor}</Text>
                    </View>
                </View>
                )
            }
            </ScrollView>
            
            <StatusBar style="auto" />
        </View>
    );
}
 
