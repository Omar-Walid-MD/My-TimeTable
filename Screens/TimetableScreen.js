import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, View, Image, Pressable, ScrollView, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Octicons, Feather } from 'react-native-vector-icons'
import themes from '../themes';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAddTableModal, setPeriodInForm, setPeriodModalForm, setTableSettingsModal } from '../Store/Modals/modalsSlice';
import PopupContainer from '../Components/PopupContainer';
import Text from '../Components/Text';
import PeriodFormModal from '../Components/Modals/PeriodFormModal';
import { getTimeString, popup } from '../helper';
import { setPeriodToView } from '../Store/Modals/modalsSlice';
import PeriodViewModal from '../Components/Modals/PeriodViewModal';
import TableSettingsModal from '../Components/Modals/TableSettingsModal';
import AddTableModal from '../Components/Modals/AddTableModal';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';


export default function TimetableScreen({navigation}) {

    const styles = useSelector(store => store.settings.styles);
    const { t } = useTranslation();

    const s = 150;
    const dispatch = useDispatch();

    const tables = useSelector(store => store.tables.tables);
    const currentTable = useSelector(store => store.tables.currentTable);

    const [tableIndex,setTableIndex] = useState(currentTable || 0);

    useEffect(()=>{
        setTableIndex(currentTable);
    },[currentTable]);

    useEffect(()=>{
        if(tableIndex >= tables.length) setTableIndex(tables.length-1);
    },[tables.length]);

    return (
        <View style={styles["page-container"]}>
            <View style={{flexDirection:"row",width:"100%",paddingHorizontal:10,paddingBottom:20}}>

                <ScrollView style={{width:"100%",padding:20,paddingBottom:4}} contentContainerStyle={{flexDirection:"row",
                    
                    flexGrow:1,alignItems:"center",gap:20}} horizontal>
                {
                    tables.map((table,index)=>
                    <View style={{flexDirection:"row",alignItems:"center",gap:20,...(tableIndex===index ? styles["table-tab-active"] : styles["table-tab"])}} key={`table-${index}`}>
                        <Pressable onPress={()=>setTableIndex(index)}>
                        {
                            currentTable === index ?
                            <Text style={{...styles["text"],...styles["bg-current"],fontSize:20,color:"white",paddingHorizontal:4,padding:2,borderRadius:5}}>{table.name}</Text>
                            :
                            <Text style={{...styles["text"],fontSize:20,...(tableIndex===index ? {color:"black"} : styles["color-faint"])}}>{table.name}</Text>
                        }
                        </Pressable>
                        {
                            tableIndex===index &&
                            <Pressable style={{backgroundColor:"black",borderRadius:5,padding:5}} onPress={()=>{
                                dispatch(setTableSettingsModal(true));
                            }}>
                                <MaterialCommunityIcons name='pencil' size={15} color="white" />
                            </Pressable>
                        }
                        
                    </View>
                    )
                }
                    <Pressable style={{...styles["bg-faint"],borderRadius:5,paddingHorizontal:10,paddingVertical:5,marginBottom:12,flexDirection:"row",alignItems:"center",gap:5}} onPress={()=>{
                        dispatch(setAddTableModal(true));
                    }}>
                        <Octicons name='plus' size={20} color="white" />
                        <Text style={{color:"white"}}>{t("tables.add-table")}</Text>
                    </Pressable>

                </ScrollView>
            </View>

            <View style={{flex:1,paddingHorizontal:10,paddingBottom:10}}>
                <ScrollView horizontal contentContainerStyle={{flexDirection:"column",flexGrow:1}}>
                    <View style={{flexDirection:"row"}}>
                    {
                        Array.from({length:tables[tableIndex]?.content.length}).map((x,index)=>
                        <View style={{width:s,alignItems:"center",paddingBottom:10}} key={`day-tab-${index}`}>
                            <Text style={{...styles.text,fontSize:20,textTransform:"uppercase"}}>{t(`days.${index}`)}</Text>
                        </View>
                        )
                    }
                    </View>
                    <ScrollView contentContainerStyle={{flexGrow:1}}>
                        <View style={{flexDirection:"row"}}>
                        {

                            tables[tableIndex]?.content.map((dayPeriods,dayIndex)=>

                            <View style={{width:s}} key={`table-item-${dayIndex}`}>
                                <View style={{width:"100%"}}>

                                    {
                                        dayPeriods.map((period,periodIndex) =>
                                        <Pressable
                                        style={{width:"100%",alignItems:"center",justifyContent:"center",height:s,padding:2}}
                                        onPress={()=>{
                                            dispatch(setPeriodToView(period));
                                        }}
                                        key={`table-period-${dayIndex}-${periodIndex}`}>
                                            <View style={{width:"100%",height:"100%",alignItems:"center",justifyContent:"center",borderRadius:5,shadowColor:"black",elevation:5,
                                                ...styles[`bg-period-${(dayIndex*2+periodIndex)%4+1}`]}}>
                                                <Text weight='b' style={{textAlign:"center",fontSize:15,margin:5,lineHeight:20}} numberOfLines={3}>{period.title}</Text>
                                                <Text style={{position:"absolute",top:0,...styles.positionLeft,padding:5,fontSize:10}}>{getTimeString(period.from)} - {getTimeString(period.to)}</Text>
                                                <Text style={{position:"absolute",bottom:0,...styles.positionLeft,padding:5,fontSize:10}}>{period.location}</Text>
                                            </View>
                                        </Pressable>
                                        )
                                    }
                                    <View style={{width:"100%"}}>
                                        <Pressable style={{width:"100%",alignItems:"center",justifyContent:"center",height:s,padding:2}}
                                        onPress={()=>{
                                            dispatch(setPeriodInForm({
                                                index: dayPeriods.length,
                                                title: "",
                                                from: "",
                                                to: "",
                                                location: "",
                                                instructor: "",
                                                day: dayIndex
                                            }));
                                            dispatch(setPeriodModalForm("add"));
                                        }}>
                                            <View style={{...styles["bg-period-none"],width:"100%",alignItems:"center",justifyContent:"center",height:"100%",borderRadius:5,shadowColor:"black",elevation:5}}>
                                                <View style={{backgroundColor:"white",paddingHorizontal:8,paddingVertical:2,borderRadius:5}}>
                                                    <Octicons name='plus' size={30} color="gray" />
                                                </View>
                                            </View>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                            )
                        }
                        </View>
                    </ScrollView>
                </ScrollView>
            </View>

            
            {/* MODALS */}
            <PeriodFormModal tables={tables} tableIndex={tableIndex}/>
            
            <PeriodViewModal tables={tables} tableIndex={tableIndex} />

            <TableSettingsModal tables={tables} tableIndex={tableIndex} />

            <AddTableModal tables={tables} />

            
            <PopupContainer />

            <StatusBar style="auto"/>
        </View>
    );
}
 
