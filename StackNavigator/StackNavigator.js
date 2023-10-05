import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from "../Screens/HomeScreen";
import { StyleSheet } from "react-native";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const Stack = createNativeStackNavigator();

export default function StackNavigator()
{
    const dispatch = useDispatch();

    useEffect(()=>{

    },[]);

    return (
        <Stack.Navigator screenOptions={{headerShown: false, gestureEnabled: false}}>
            <Stack.Group>
                <Stack.Screen name="Home" component={HomeScreen} />
            </Stack.Group>
        </Stack.Navigator>
    );
}

