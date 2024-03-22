import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import themes from '../themes';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { setLang, setMinutes, setTheme } from '../Store/slice/settingsSlice';
import { addPeriodNotification, cancelAllNotifications } from '../notifications';
import { updateTables } from '../Store/slice/slice';
import LoadingOverlay from '../Components/LoadingOverlay';
import PopupContainer from '../Components/PopupContainer';
import { addPopup, clearPopups } from '../Store/slice/popupsSlice';
import AppText from "../Components/AppText"

import notifee from "@notifee/react-native"
import i18n from '../i18n';

export default function SettingsScreen({navigation}) {

    const styles = useSelector(store => store.settings.styles);
    const currentTheme = useSelector(store => store.settings.theme);
    const currentMinutes = useSelector(store => store.settings.minutes);
    const currentLang = useSelector(store => store.settings.lang);

    const tables = useSelector(store => store.tables.tables);
    const currentTable = useSelector(store => store.tables.currentTable);

    const loading = useSelector(store => store.tables.loading);

    const minutesOptions = [0,5,10,15,20,30];
    const langOptions = ["ar","en"];

    const dispatch = useDispatch();

    function popup(text)
    {
        dispatch(addPopup({text:i18n.t(`popup.${text}`)}));
    }

    async function refreshNotifications(before)
    {
        
        await cancelAllNotifications()
        .then(()=>{
            if(tables.length)
            {
                let targetTable = tables[currentTable];
                Object.keys(targetTable.content).forEach((day)=>{
                        
                    targetTable.content[day].forEach(async (period)=>{
                        period.notifId = await addPeriodNotification(period,before,i18n.t("notif"));
                    });
                });
                dispatch(updateTables(prevTables => prevTables.map((t,i) => i===currentTable ? targetTable : t)));
            }
            popup("minutes")
        })

    }

    return (
        <View style={styles.pageContainer}>
            <View style={{width:"100%",gap:40,padding:20}}>
                <View style={{width:"100%",alignItems:"center",gap:15}}>
                    <AppText fontFamily={""} style={{fontSize:20,borderBottomWidth:2,borderColor:"black",paddingBottom:5}}>{i18n.t("settings.theme")}</AppText>
                    
                    <View style={{flexDirection:"row",gap:10,paddingHorizontal:50,flexWrap:"wrap",justifyContent:"center"}}>
                    {
                        Object.keys(themes).map((theme)=>
                        <Pressable
                        key={`theme-button-${theme}`}
                        style={currentTheme===theme ? {...styles.button,width:100,...styles.bgCurrent} : {...styles.button,width:100,borderColor:themes[theme]["current"],borderWidth:2}}
                        onPress={()=>{dispatch(setTheme(theme)).then(()=>popup("theme"));}}
                        >
                            <AppText fontFamily={""} fontWeight={"bold"} style={{fontSize:20,textTransform:"capitalize",color:themes[theme][currentTheme===theme ? "bg" : "current"]}}>{i18n.t(`settings.${theme}`)}</AppText>
                        </Pressable>
                        )
                    }
                    </View>
                </View>
                <View style={{width:"100%",alignItems:"center",gap:20}}>
                    <AppText fontFamily={""} style={{fontSize:20,borderBottomWidth:2,borderColor:"black",paddingBottom:5}}>{i18n.t("settings.notify-before")}</AppText>
                    <View style={{flexWrap:"",flexDirection:"row",gap:10}}>
                    {
                        minutesOptions.map((minutes)=>
                        <Pressable
                        style={{display:"flex",alignItems:"center",justifyContent:"center",width:40,height:40,borderRadius:5,borderColor:"black",borderWidth:2,backgroundColor: currentMinutes===minutes ? "black" : "transparent"}}
                        key={`minute-option-${minutes}`}
                        onPress={()=>{if(currentMinutes!==minutes){dispatch(setMinutes(minutes));refreshNotifications(minutes);}}}
                        >
                            <AppText fontFamily={""} style={{color:currentMinutes===minutes ? "white" : "black"}}>{minutes}</AppText>
                        </Pressable>
                        )
                    }
                    </View>
                </View>
                <View style={{width:"100%",alignItems:"center",gap:20}}>
                    <AppText fontFamily={""} style={{fontSize:20,borderBottomWidth:2,borderColor:"black",paddingBottom:5}}>{i18n.t("settings.lang")}</AppText>
                    <View style={{flexWrap:"",flexDirection:"row",gap:10}}>
                    {
                        langOptions.map((lang)=>
                        <Pressable
                        style={{display:"flex",alignItems:"center",justifyContent:"center",width:40,height:40,borderRadius:5,borderColor:"black",borderWidth:2,backgroundColor: currentLang===lang ? "black" : "transparent"}}
                        key={`lang-option-${lang}`}
                        onPress={()=>{
                            dispatch(setLang(lang))
                            .then(()=>{
                                dispatch(clearPopups())
                                .then(()=>popup("lang"))
                            })
                        }}
                        >
                            <AppText fontFamily={""} style={{color:currentLang===lang ? "white" : "black",textTransform:"capitalize"}}>{lang}</AppText>
                        </Pressable>
                        )
                    }
                    </View>
                </View>
            </View>
            <PopupContainer />
            <LoadingOverlay visible={loading} />
            <StatusBar style="auto" />
        </View>
    );
}
 
