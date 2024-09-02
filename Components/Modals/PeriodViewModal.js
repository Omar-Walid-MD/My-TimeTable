import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setPeriodInForm, setPeriodModalForm, setPeriodToView } from '../../Store/Modals/modalsSlice';
import { MaterialCommunityIcons, MaterialIcons, Octicons, Feather } from 'react-native-vector-icons'

import { getTimeString, popup } from '../../helper';
import { deletePeriod, updateTables } from '../../Store/Tables/tablesSlice';
import { cancelNotification } from '../../notifications';
import Text from '../Text';
import { useTranslation } from 'react-i18next';

export default function PeriodViewModal({tables, tableIndex}) {


    const dispatch  = useDispatch();
    const { t } = useTranslation();

    const styles = useSelector(store => store.settings.styles);
    const currentTheme = useSelector(store => store.settings.theme);
    const currentTable = useSelector(store => store.tables.currentTable);
    const periodToView = useSelector(store => store.modals.periodToView);

    function handleDeletePeriod(period)
    {
        if(currentTable === tableIndex) cancelNotification(period.notifId);
        dispatch(deletePeriod({period,tableIndex}));
        dispatch(setPeriodToView(null));
        popup("delete-period");
    }

    return (
        <Modal visible={periodToView!==null} animationType='slide' transparent onRequestClose={() => dispatch(setPeriodToView(null))}>
            <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                <View style={{...styles["bg-main"],width:"90%",padding:15,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                    {
                        periodToView &&

                        <View style={{alignItems:"center",gap:10,marginBottom:20}}>
                            <Text style={{...styles.text,...styles["color-faint"],fontSize:15}}>{getTimeString(periodToView.from)} - {getTimeString(periodToView.to)}</Text>
                            <Text style={{...styles.text,fontSize:40,textAlign:"center",marginBottom:20}}>{periodToView.title}</Text>
                            {periodToView.location && <Text style={{...styles.text,...styles["color-faint-2"],fontSize:20,textTransform:"capitalize",textAlign:"center"}}>{t("home.at")}: {periodToView.location}</Text>}
                            {periodToView.instructor && <Text style={{...styles.text,...styles["color-faint"],fontSize:20,...styles["color-faint"],textTransform:"capitalize",textAlign:"center"}}>{t("home.by")}: {periodToView.instructor}</Text>}
                        </View>
                    }

                    <View style={{gap:10}}>
                        <Pressable style={{...styles["button"],...styles["bg-primary"]}} onPress={()=>{
                            dispatch(setPeriodModalForm("edit"));
                            dispatch(setPeriodInForm(periodToView));
                            dispatch(setPeriodToView(null));
                        }}>
                            <MaterialCommunityIcons name="pencil-box-outline" color="white" size={30} />
                            <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.edit")}</Text>
                        </Pressable>

                        <Pressable style={{...styles["button"],...styles["bg-danger"]}} onPress={()=>handleDeletePeriod(periodToView)}>
                            <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                            <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.delete")}</Text>
                        </Pressable>
                    </View>

                    <View
                    //style[position:"absolute" top:0 width:"100%"]
                    style={{position:"absolute",top:0,width:"100%",alignItems:"flex-end",paddingTop:15}}
                    >
                        <Pressable style={{padding:5,borderRadius:5,backgroundColor:"black"}} onPress={()=>{
                            dispatch(setPeriodToView(null));
                        }}>
                            <Feather name="x" size={20} color="white" />
                        </Pressable>
                    </View>

                </View>
            </View>

        </Modal>
    );
}

