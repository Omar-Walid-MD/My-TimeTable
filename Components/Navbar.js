import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import styles from '../styles';
import { useRoute } from '@react-navigation/native';

export default function NavBar({state, descriptors, navigation, position}) {

    return (

        <View style={styles.navbar}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                    ? options.title
                    : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                }
                };

                const onLongPress = () => {
                navigation.emit({
                    type: 'tabLongPress',
                    target: route.key,
                });
                };

                const inputRange = state.routes.map((_, i) => i);
                const opacity = position.interpolate({
                inputRange,
                outputRange: inputRange.map(i => (i === index ? 1 : 0)),
                });

                return (
                <Pressable
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{paddingTop: index===1 ? 5 : 0}}
                key={`tab-button-${index}`}
                >
                <MaterialCommunityIcons name={label==="Home" ? "home" : "timetable"} size={index===1 ? 35 : 40} color={state.index===index ? "#C8FFC8" : "#87A087"} />
            </Pressable>
           
                );
            })}
            {/* <Pressable onPress={()=>navigation.navigate("Home")}>
                <MaterialCommunityIcons name='home' size={40} color={route.name==="Home" ? "#C8FFC8" : "#87A087"} />
            </Pressable>
           
            <Pressable style={{paddingTop:5}} onPress={()=>navigation.navigate("Timetable")}>
                <MaterialCommunityIcons name='timetable' size={35} color={route.name==="Timetable" ? "#C8FFC8" : "#87A087"} />
            </Pressable> */}

        </View>
    );
}
 
