import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setPeriodInForm, setPeriodModalForm, setPeriodToView } from '../../Store/Modals/modalsSlice';
import { MaterialCommunityIcons, MaterialIcons, Octicons, Feather } from 'react-native-vector-icons'

import { getTimeString, popup } from '../../helper';
import { deletePeriod, updateTables } from '../../Store/Tables/tablesSlice';
import { cancelNotification } from '../../notifications';
import themes from '../../themes';
import Text from '../Text';
import i18n from '../../i18n';

export default function PeriodViewModal({tables, tableIndex}) {

    const dayStrings = ["sat","sun","mon","tue","wed","thu"]

    const dispatch  = useDispatch();

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
        <Modal visible={periodToView!==null} animationType='slide' transparent>
            <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                <View style={{width:"90%",backgroundColor:themes[currentTheme]["bg"],padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                    {
                        periodToView &&

                        <View style={{alignItems:"center",gap:10,marginBottom:20}}>
                            <Text fontFamily={""} style={{...styles.text,fontSize:15,color:themes[currentTheme]["faint"]}}>{getTimeString(periodToView.from)} - {getTimeString(periodToView.to)}</Text>
                            <Text fontFamily={""} style={{...styles.text,fontSize:40,textAlign:"center",marginBottom:20}}>{periodToView.title}</Text>
                            {periodToView.location && <Text fontFamily={""} style={{...styles.text,fontSize:20,color:themes[currentTheme]["faint-2"],textTransform:"capitalize",textAlign:"center"}}>{i18n.t("home.at")}: {periodToView.location}</Text>}
                            {periodToView.instructor && <Text fontFamily={""} style={{...styles.text,fontSize:20,color:themes[currentTheme]["faint"],textTransform:"capitalize",textAlign:"center"}}>{i18n.t("home.by")}: {periodToView.instructor}</Text>}
                        </View>
                    }

                    <View style={{gap:10}}>
                        <Pressable style={{...styles.button,...styles.bgPrimary}} onPress={()=>{
                            dispatch(setPeriodModalForm("edit"));
                            dispatch(setPeriodInForm(periodToView));
                            dispatch(setPeriodToView(null));
                        }}>
                            <MaterialCommunityIcons name="pencil-box-outline" color="white" size={30} />
                            <Text fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.edit")}</Text>
                        </Pressable>

                        <Pressable style={{...styles.button,...styles.bgDanger}} onPress={()=>handleDeletePeriod(periodToView)}>
                            <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                            <Text fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.delete")}</Text>
                        </Pressable>
                    </View>

                    <Pressable style={{position:"absolute",top:0,...styles.positionRight,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>{
                        dispatch(setPeriodToView(null));
                    }}>
                        <Feather name="x" size={20} color="white" />
                    </Pressable>

                </View>
            </View>

        </Modal>
    );
}

