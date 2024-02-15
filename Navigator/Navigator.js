import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import HomeScreen from "../Screens/HomeScreen";
import { StyleSheet } from "react-native";
import { useDispatch } from 'react-redux';
import TimetableScreen from '../Screens/TimetableScreen';
import { getCurrentTable, getTables } from '../Store/slice/slice';
import NavBar from '../Components/Navbar';

const Tab = createMaterialTopTabNavigator();


export default function Navigator()
{
    const dispatch = useDispatch();
    dispatch(getTables());
    dispatch(getCurrentTable());

    return (
        <Tab.Navigator
        screenOptions={{swipeEnabled:false}}
        // screenOptions={{headerShown: false, gestureEnabled: false,animation:"slide_from_right"}}
        tabBar={props => <NavBar {...props} />}
        >
            <Tab.Group>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Timetable" component={TimetableScreen} />

            </Tab.Group>
        </Tab.Navigator>
    );
}

