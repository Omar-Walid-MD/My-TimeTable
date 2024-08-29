import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HomeScreen from "../Screens/HomeScreen";
import { StyleSheet } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import TimetableScreen from '../Screens/TimetableScreen';
import NavBar from '../Components/Navbar';
import SettingsScreen from '../Screens/SettingsScreen';
import { useEffect } from 'react';
import { getCurrentTable, getTables } from '../Store/Tables/tablesSlice';
import { getLang, getMinutes, getTheme } from '../Store/Settings/settingsSlice';

const Tab = createMaterialTopTabNavigator();


export default function Navigator()
{
    const dispatch = useDispatch();

    useEffect(()=>{

        dispatch(getTables());
        dispatch(getCurrentTable());
        dispatch(getTheme());
        dispatch(getMinutes());
        dispatch(getLang());
    },[]);

    return (
        <Tab.Navigator
        screenOptions={{swipeEnabled:false}}
        // screenOptions={{headerShown: false, gestureEnabled: false,animation:"slide_from_right"}}
        tabBar={props => <NavBar {...props} />}
        >
            <Tab.Group>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Timetable" component={TimetableScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen}/>
            </Tab.Group>
        </Tab.Navigator>
    );
}

