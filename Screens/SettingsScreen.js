import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import themes from '../themes';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { setLang, setMinutes, setTheme } from '../Store/Settings/settingsSlice';
import { addPeriodNotification, cancelAllNotifications } from '../notifications';
import PopupContainer from '../Components/PopupContainer';
import { addPopup, clearPopups } from '../Store/Popups/popupsSlice';
import Text from "../Components/Text"
import { useTranslation } from 'react-i18next';
import i18n, { changeLanguage } from '../i18n';
import { setTable } from '../Store/Tables/tablesSlice';
import Button from '../Components/Button';

export default function SettingsScreen({navigation}) {

    const styles = useSelector(store => store.settings.styles);
    const currentTheme = useSelector(store => store.settings.theme);
    const currentMinutes = useSelector(store => store.settings.minutes);

    const tables = useSelector(store => store.tables.tables);
    const currentTable = useSelector(store => store.tables.currentTable);

    const { t } = useTranslation();

    const minutesOptions = [0,5,10,15,20,30];
    const langOptions = [
        {
            code: "ar",
            name: "العربية"
        },
        {
            code: "en",
            name: "English"
        }
    ];

    const dispatch = useDispatch();

    function popup(text)
    {
        dispatch(addPopup({text:t(`popup.${text}`)}));
    }

    async function refreshNotifications(before=currentMinutes)
    {
        if(currentTable!==null)
        {
            await cancelAllNotifications()
            .then(()=>{
                if(tables.length)
                {
                    let targetTable = tables[currentTable];
                    targetTable.content.forEach((day)=>{
                        day.forEach(async (period)=>{
                            period.notifId = await addPeriodNotification(period,before,t);
                        });
                    });
                    dispatch(setTable({tableIndex:currentTable,table:targetTable}));
                }
                popup("minutes")
            })
        }
    }

    return (
        <View style={styles["page-container"]}>
            <View style={{width:"100%",gap:40,padding:20}}>
                <View style={{width:"100%",alignItems:"center",gap:15}}>
                    <Text fontFamily={""} style={{fontSize:20,borderBottomWidth:2,borderColor:"black",paddingBottom:5}}>{t("settings.theme")}</Text>
                    
                    <View style={{flexDirection:"row",gap:10,paddingHorizontal:50,flexWrap:"wrap",justifyContent:"center"}}>
                    {
                        Object.keys(themes).map((theme)=>
                        <Button
                        key={`theme-button-${theme}`}
                        style={currentTheme===theme ? {width:100,...styles["bg-current"]} : {width:100,borderColor:themes[theme]["current"],borderWidth:2}}
                        onPress={()=>{dispatch(setTheme(theme)).then(()=>popup("theme"));}}
                        >
                            <Text fontFamily={""} fontWeight={"bold"} style={{fontSize:20,textTransform:"capitalize",color:themes[theme][currentTheme===theme ? "bg" : "current"]}}>{t(`settings.${theme}`)}</Text>
                        </Button>
                        )
                    }
                    </View>
                </View>
                <View style={{width:"100%",alignItems:"center",gap:20}}>
                    <Text fontFamily={""} style={{fontSize:20,borderBottomWidth:2,borderColor:"black",paddingBottom:5}}>{t("settings.notify-before")}</Text>
                    <View style={{flexWrap:"wrap",flexDirection:"row",gap:10}}>
                    {
                        minutesOptions.map((minutes)=>
                        <Button
                        style={{width:45,height:45,borderColor:themes[currentTheme]["current"],borderWidth:2,backgroundColor: currentMinutes===minutes ? themes[currentTheme]["current"] : "transparent"}}
                        key={`minute-option-${minutes}`}
                        onPress={()=>{if(currentMinutes!==minutes){dispatch(setMinutes(minutes));refreshNotifications(minutes);}}}
                        >
                            <Text fontFamily={""} style={{color:currentMinutes===minutes ? "white" : themes[currentTheme]["current"]}}>{minutes}</Text>
                        </Button>
                        )
                    }
                    </View>
                </View>
                <View style={{width:"100%",alignItems:"center",gap:20}}>
                    <Text fontFamily={""} style={{fontSize:20,borderBottomWidth:2,borderColor:"black",paddingBottom:5}}>{t("settings.lang")}</Text>
                    <View style={{flexWrap:"",flexDirection:"row",gap:10}}>
                    {
                        langOptions.map((lang)=>
                        <Button
                        style={{borderColor:themes[currentTheme]["current"],borderWidth:2,backgroundColor: i18n.language===lang.code ? themes[currentTheme]["current"] : "transparent"}}
                        key={`lang-option-${lang.code}`}
                        onPress={async ()=>{
                            changeLanguage(lang.code);
                            await refreshNotifications();
                            dispatch(setLang(lang.code))
                            .then(()=>{
                                dispatch(clearPopups())
                                .then(()=>popup("lang"))
                            })
                        }}
                        >
                            <Text style={{fontSize:20,color:i18n.language===lang.code ? "white" : themes[currentTheme]["current"],textTransform:"capitalize"}}>{lang.name}</Text>
                        </Button>
                        )
                    }
                    </View>
                </View>
            </View>
            <PopupContainer />
            <StatusBar style="auto" />
        </View>
    );
}
 
