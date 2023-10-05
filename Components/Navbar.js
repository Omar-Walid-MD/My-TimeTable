import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import styles from '../styles';

export default function NavBar({navigation}) {
    return (
        <View style={styles.navbar}>
            <Pressable onPress={()=>navigation.navigate("Home")}>
                <MaterialCommunityIcons name='home' size={40} />
            </Pressable>
           
            <Pressable onPress={()=>navigation.navigate("Timetable")}>
                <MaterialCommunityIcons name='timetable' size={40} />
            </Pressable>

        </View>
    );
}
 
