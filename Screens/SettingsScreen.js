import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import themes from '../themes';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { setTheme } from '../Store/slice/themeSlice';


export default function SettingsScreen({navigation}) {

    const styles = useSelector(store => store.theme.styles);
    const currentTheme = useSelector(store => store.theme.theme);

    const dispatch = useDispatch();

    return (
        <View style={styles.pageContainer}>
            <View style={{padding:20,width:"100%",flexDirection:"row",justifyContent:"flex-start",gap:20}}>
                <Text style={{fontSize:20}}>Set Theme:</Text>
                <View style={{flexDirection:"row",gap:10}}>
                {
                    Object.keys(themes).map((theme)=>
                    <Pressable
                    key={`theme-button-${theme}`}
                    style={currentTheme===theme ? {...styles.button,...styles.bgSuccess,borderWidth:0} : {...styles.button,...styles.borderSuccess}}
                    onPress={()=>dispatch(setTheme(theme))}
                    >
                        <Text style={{fontSize:20,textTransform:"capitalize"}}>{theme}</Text>
                    </Pressable>
                    )
                }
                </View>
            </View>
            <StatusBar style="auto" />
        </View>
    );
}
 
