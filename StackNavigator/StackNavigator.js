import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from "../Screens/HomeScreen";
import { StyleSheet } from "react-native";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TimetableScreen from '../Screens/TimetableScreen';
import { getCurrentTable, getTables } from '../Store/slice/slice';

const Stack = createNativeStackNavigator();

export default function StackNavigator()
{
    const dispatch = useDispatch();
    dispatch(getTables());
    dispatch(getCurrentTable());

    // useEffect(()=>{
    // },[]);

    return (
        <Stack.Navigator screenOptions={{headerShown: false, gestureEnabled: false}}>
            <Stack.Group>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Timetable" component={TimetableScreen} />

            </Stack.Group>
        </Stack.Navigator>
    );
}

