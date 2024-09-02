import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from 'react-native-vector-icons'
import styles from '../styles';
import themes from '../themes';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { clearPopups } from '../Store/Popups/popupsSlice';

export default function NavBar({state, descriptors, navigation, position})
{

    const dispatch = useDispatch();

    const styles = useSelector(store => store.settings.styles);
    const currentTheme = useSelector(store => store.settings.theme);

    const buttons = {
        "Home": {
            icon: "home",
            size: 40,
            style: {alignItems:"flex-start"}
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

    function clearAllPopups()
    {
        dispatch(clearPopups());
    }

    return (

        <View style={styles["navbar"]}>
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
                    clearAllPopups();
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                    clearAllPopups();
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
                <MaterialCommunityIcons name={buttons[label].icon} size={buttons[label].size} style={{...(state.index===index ? styles["color-selected"] : styles["color-faint"])}} color={state.index===index ? themes[currentTheme]["selected"] : themes[currentTheme]["faint"]} />
            </Pressable>
           
                );
            })}


        </View>
    );
}
 
