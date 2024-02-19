import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from 'react-native-vector-icons'
import styles from '../styles';
import themes from '../themes';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

export default function NavBar({state, descriptors, navigation, position}) {

    const styles = useSelector(store => store.theme.styles);
    const currentTheme = useSelector(store => store.theme.theme);

    const buttons = {
        "Home": {
            icon: "home",
            size: 40,
            style: {}
        },
        "Timetable": {
            icon: "timetable",
            size: 35,
            style: {paddingTop:5,alignItems:"center"}
        },
        "Settings": {
            icon: "cog",
            size: 40,
            style: {alignItems:"flex-end"}
        }
    }


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

                return (
                <Pressable
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{...buttons[label].style,flexGrow:1}}
                key={`tab-button-${index}`}
                >
                <MaterialCommunityIcons name={buttons[label].icon} size={buttons[label].size} color={state.index===index ? themes[currentTheme]["selected"] : themes[currentTheme]["faint"]} />
            </Pressable>
           
                );
            })}
            {/* <Pressable onPress={()=>navigation.navigate("Home")}>
                <MaterialCommunityIcons name='home' size={40} color={route.name==="Home" ? "#C8FFC8" : themes[currentTheme]["faint"]} />
            </Pressable>
           
            <Pressable style={{paddingTop:5}} onPress={()=>navigation.navigate("Timetable")}>
                <MaterialCommunityIcons name='timetable' size={35} color={route.name==="Timetable" ? "#C8FFC8" : themes[currentTheme]["faint"]} />
            </Pressable> */}

        </View>
    );
}
 
