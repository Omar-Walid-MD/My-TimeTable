import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setPeriodInForm, setPeriodModalForm, setPeriodToView } from '../../Store/Modals/modalsSlice';
import { MaterialCommunityIcons, MaterialIcons, Octicons, Feather } from 'react-native-vector-icons'

import { getTimeString } from '../../helpers';
import { deletePeriod } from '../../Store/Tables/tablesSlice';
import { cancelNotification } from '../../notifications';
import Text from '../Text';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { addPopup } from '../../Store/Popups/popupsSlice';
import Button from '../Button';

export default function PeriodViewModal({tables, tableIndex}) {


    const dispatch  = useDispatch();
    const { t } = useTranslation();

    const styles = useSelector(store => store.settings.styles);
    const currentTheme = useSelector(store => store.settings.theme);
    const currentTable = useSelector(store => store.tables.currentTable);
    const periodToView = useSelector(store => store.modals.periodToView);

    function popup(text)
    {
        dispatch(addPopup({text:t(`popup.${text}`)}));
    }

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
                <View style={{...styles["bg-white"],width:"90%",padding:15,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                    {
                        periodToView &&

                        <View style={{alignItems:"center",marginBottom:20}}>
                            <View style={{flexDirection: i18n.language==="ar" ? "row-reverse" : "row",alignItems:"center",gap:5}}>
                                <Text style={{...styles["color-faint"],fontSize:15}}>{getTimeString(periodToView.to)}</Text>
                                <Octicons name="triangle-left" size={30} style={{...styles["color-faint-2"],marginHorizontal:2.5,transform:[{scaleX: i18n.language==="ar" ? 1 : -1}]}} />
                                <Text style={{...styles["color-faint"],fontSize:15}}>{getTimeString(periodToView.from)}</Text>
                                <MaterialCommunityIcons name="clock" size={25} style={{...styles["color-faint-2"]}} />
                            </View>

                            {/* <Text style={{...styles.text,...styles["color-faint"],fontSize:15}}>{getTimeString(periodToView.from)} - {getTimeString(periodToView.to)}</Text> */}
                            <Text style={{...styles.text,fontSize:35,textAlign:"center",marginBottom:20,textTransform:"capitalize"}}>{periodToView.title}</Text>
                            
                            {
                                periodToView.location &&
                                <View
                                style={{flexDirection: i18n.language==="ar" ? "row" : "row-reverse",alignItems:"center",gap:5}}
                                >
                                    <Text style={{...styles.text,...styles["color-faint-2"],fontSize:18,textTransform:"capitalize",textAlign:"center"}}>{periodToView.location}</Text>
                                    <MaterialIcons name="location-on" size={25} style={{...styles["color-faint-2"]}} />
                                </View>
                            }
                            {
                                periodToView.instructor &&
                                <View
                                style={{flexDirection: i18n.language==="ar" ? "row" : "row-reverse",alignItems:"center",gap:5}}
                                >
                                    <Text style={{...styles.text,...styles["color-faint"],fontSize:18,...styles["color-faint"],textTransform:"capitalize",textAlign:"center"}}>{periodToView.instructor}</Text>
                                    <MaterialIcons name="person" size={25} style={{...styles["color-faint"]}} />
                                </View>
                            }
                        </View>
                    }

                    <View style={{flexDirection:"row",gap:10}}>
                        <Button style={{...styles["bg-primary"]}} onPress={()=>{
                            dispatch(setPeriodModalForm("edit"));
                            dispatch(setPeriodInForm(periodToView));
                            dispatch(setPeriodToView(null));
                        }}>
                            <MaterialCommunityIcons name="pencil-box-outline" color="white" size={30} />
                            <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.edit")}</Text>
                        </Button>

                        <Button style={{...styles["bg-danger"]}} onPress={()=>handleDeletePeriod(periodToView)}>
                            <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                            <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.delete")}</Text>
                        </Button>
                    </View>

                    <View
                    style={{position:"absolute",top:0,width:"100%",alignItems:"flex-end",paddingTop:15}}
                    >
                        <Button style={{paddingHorizontal:5,gap:0,backgroundColor:"black"}} onPress={()=>{
                            dispatch(setPeriodToView(null));
                        }}>
                            <Feather name="x" size={20} color="white" />
                        </Button>
                    </View>

                </View>
            </View>

        </Modal>
    );
}

