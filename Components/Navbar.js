import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import styles from '../styles';
import { useRoute } from '@react-navigation/native';

export default function NavBar({navigation}) {

    const route = useRoute();

    return (

        <View style={styles.navbar}>
            <Pressable onPress={()=>navigation.navigate("Home")}>
                <MaterialCommunityIcons name='home' size={40} color={route.name==="Home" ? "#C8FFC8" : "#87A087"} />
            </Pressable>
           
            <Pressable style={{paddingTop:5}} onPress={()=>navigation.navigate("Timetable")}>
                <MaterialCommunityIcons name='timetable' size={35} color={route.name==="Timetable" ? "#C8FFC8" : "#87A087"} />
            </Pressable>

        </View>
    );
}
 
