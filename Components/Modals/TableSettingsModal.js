import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons, Octicons, Feather } from 'react-native-vector-icons'
import { useDispatch, useSelector } from "react-redux";
import Text from "../Text";
import themes from '../../themes';
import { deleteTable, editTableTitle, resetTable, setCurrentTable, setTable } from "../../Store/Tables/tablesSlice";
import { setTableSettingsModal } from "../../Store/Modals/modalsSlice";
import { popup } from "../../helper";
import { addPeriodNotification, cancelAllNotifications } from "../../notifications";

import * as FileSystem from 'expo-file-system';
import { useTranslation } from "react-i18next";


function TableSettingsModal({tables,tableIndex}) {

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const tableSettingsModal = useSelector(store => store.modals.tableSettingsModal);

    const currentTable = useSelector(store => store.tables.currentTable);
    const styles = useSelector(store => store.settings.styles);
    const currentMinutes = useSelector(store => store.settings.minutes);

    const [isEditingTableTitle,setIsEditingTableTitle] = useState(false);
    const [tableTitleEdit,setTableTitleEdit] = useState(false);
    const [confirming,setConfirming] = useState(null);

    function handleResetTable()
    {
        dispatch(setTableSettingsModal(false));
        dispatch(resetTable(tableIndex));
        if(currentTable === tableIndex)
        {
            cancelAllNotifications();
        }
        popup("reset-table");
    }

    async function handleDeleteTable()
    {
        if(tables.length>1)
        {
            dispatch(setTableSettingsModal(false));

            let newIndex = tableIndex>0 ? tableIndex-1 : tableIndex+1;
            if(tableIndex===currentTable) dispatch(setCurrentTable(newIndex));

            dispatch(deleteTable(tableIndex));
            
            if(currentTable === tableIndex)
            {
                await cancelAllNotifications()
                .then(()=>{
                    addTableNotifications(newIndex);
                })
            }
            popup("delete-table");
        }
    }

    async function enableTable(newTableIndex)
    {
        await cancelAllNotifications()
        .then(()=>{
            dispatch(setCurrentTable(newTableIndex));
            addTableNotifications(newTableIndex);
            popup("set-table");
        })
    }

    // async function disableTable()
    // {
    //     await cancelAllNotifications()
    //     .then(()=>{
    //         dispatch(setCurrentTable(null));
    //         popup("set-table");
    //     })
    // }

    
    function addTableNotifications(tableIndex)
    {
        let targetTable = tables[tableIndex];
        Object.keys(targetTable.content).forEach((day)=>{
                
            targetTable.content[day].forEach(async (period)=>{
                // console.log(period.title,period.day)
                period.notifId = await addPeriodNotification(period,currentMinutes,t);
            });
        });
        dispatch(setTable({tableIndex,table:targetTable}));
    }

    async function exportTable()
    {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
            return;
        }

        try {
            let exportedTable = JSON.parse(JSON.stringify(tables[tableIndex]));
            Object.keys(exportedTable.content).forEach((day)=>{
                exportedTable.content[day] = exportedTable.content[day].map((period) => ({...period,notifId:""}));
            });

            let fileUri = permissions.directoryUri;
            let fileName = `${exportedTable.name}-table.json`;
            
            await FileSystem.StorageAccessFramework.createFileAsync(fileUri,fileName,"application/json").then(async (newUri)=>{
                let n = await FileSystem.StorageAccessFramework.writeAsStringAsync(newUri, JSON.stringify(exportedTable));
            })
        } catch (e) {
            throw new Error(e);
        }

        dispatch(setTableSettingsModal(false));
        popup("export-table");
    }


    return (
        <Modal visible={tableSettingsModal} animationType='slide' transparent onRequestClose={() => dispatch(setTableSettingsModal(null))}>
            <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                <View style={{...styles["bg-white"],width:"90%",padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>
                    {
                        tables[tableIndex] &&
                        <View style={{marginBottom:30}}>
                        {
                            isEditingTableTitle ?
                            <View style={{flexDirection:"column",alignItems:"center",gap:10}}>
                                <TextInput
                                style={{...styles["text-input"],width:200}}
                                value={tableTitleEdit}
                                onChangeText={(text)=>setTableTitleEdit(text)}
                                />
                                <Pressable
                                style={{width:"100%",backgroundColor:"black",borderRadius:5,padding:5}}
                                onPress={()=>{
                                    if(tableTitleEdit)
                                    {
                                        dispatch(editTableTitle({
                                            tableIndex,
                                            newTableTitle: tableTitleEdit
                                        }))
                                        setTableTitleEdit("");
                                        setIsEditingTableTitle(false);
                                    }
                                    }}>
                                    <Text fontFamily={""} style={{...styles.text,color:"white",fontSize:20,textAlign:"center"}}>{t("tables.confirm")}</Text>
                                </Pressable>
                            </View>
                            :
                            <>
                                <Text fontFamily={""} style={{...styles.text,fontSize:30,borderColor:"black",borderBottomWidth:2,paddingHorizontal:20}}>{tables[tableIndex].name}</Text>

                                <Pressable style={{position:"absolute",bottom:-12,right:-10,backgroundColor:"black",borderRadius:20,padding:5}} onPress={()=>{setIsEditingTableTitle(true);setTableTitleEdit(tables[tableIndex].name);}}>
                                    <MaterialCommunityIcons name='pencil' size={15} color="white" />
                                </Pressable>
                            </>
                        }
                        </View>
                    }

                    <View style={{flexDirection:"column",gap:20,alignItems:"stretch"}}>
                        {
                            tables.length > 1 &&
                            <Pressable onPress={()=>setConfirming("delete")} style={{...styles["button"],...styles["bg-danger"]}}>
                                <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                                <Text fontFamily={""} style={{color:"white",fontSize:20}}>{t("tables.delete")}</Text>
                            </Pressable>
                        }
                        {
                            tableIndex !== currentTable &&
                            <Pressable onPress={()=>enableTable(tableIndex)} style={{...styles["button"],...styles["bg-success"]}}>
                                <MaterialCommunityIcons name="check-circle-outline" color="white" size={30} /> 
                                <Text fontFamily={""} style={{...styles.text,fontSize:20,color:"white",}}>{t("tables.enable")}</Text>
                            </Pressable>
                            // : tables.length > 1 &&
                            // <Pressable onPress={()=>disableTable()} style={{...styles["button"],...styles["bg-danger"]}}>
                            //     <Feather name="x-circle" color="white" size={30} /> 
                            //     <Text fontFamily={""} style={{...styles.text,fontSize:20,color:"white",}}>{t("tables.disable")}</Text>
                            // </Pressable>
                        }
                        <Pressable style={{...styles["button"],...styles["bg-primary"]}} onPress={()=>setConfirming("reset")}>
                            <MaterialCommunityIcons name="refresh" color="white" size={30} /> 
                            <Text fontFamily={""} style={{color:"white",fontSize:20}}>{t("tables.reset")}</Text>
                        </Pressable>

                        <Pressable style={{...styles["button"],...styles["bg-success"]}} onPress={()=>exportTable()}>
                            <MaterialCommunityIcons name="export" color="white" size={30} /> 
                            <Text fontFamily={""} style={{color:"white",fontSize:20}}>{t("tables.export")}</Text>
                        </Pressable>
                    </View>

                    <View
                    //style[position:"absolute" top:0 width:"100%"]
                    style={{position:"absolute",top:0,width:"100%",alignItems:"flex-end",paddingTop:15}}
                    >
                        <Pressable style={{padding:5,borderRadius:5,backgroundColor:"black"}} onPress={()=>{
                            dispatch(setTableSettingsModal(false));
                            setTableTitleEdit("");
                            setIsEditingTableTitle(false);
                            }}>
                            <Feather name="x" size={20} color="white" />
                        </Pressable>
                    </View>

                </View>
            </View>
            {
                confirming &&
                <View style={{position:"absolute",top:0,...styles.positionLeft,width:"100%",height:"100%",alignItems:"center",justifyContent:"center",padding:50,backgroundColor:"rgba(0,0,0,0.7)"}}>
                    <View style={{width:"100%",alignItems:"center",backgroundColor:"white",padding:20,borderRadius:5,shadowColor:"black",elevation:5}}>
                        <Text fontFamily={""} style={{fontSize:25,textTransform:"capitalize"}}>{t(`tables.confirm-${confirming}-title`)}</Text>
                        <Text fontFamily={""} style={{fontSize:20,marginVertical:20}}>{t(`tables.confirm-${confirming}-message`)}</Text>

                        <View style={{...styles["flex-row"],justifyContent:"space-between",width:"100%"}}>
                            <Pressable style={{...styles["button"],backgroundColor:"gray"}} onPress={()=>setConfirming(null)}>
                                <Text fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.cancel")}</Text>
                            </Pressable>
                            
                            {
                                confirming==="reset" ?
                                <Pressable style={{...styles["button"],...styles["bg-danger"]}} onPress={()=>{handleResetTable();setConfirming(null);}}>
                                    <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                                    <Text fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.reset")}</Text>
                                </Pressable>
                                :
                                confirming==="delete" &&
                                <Pressable style={{...styles["button"],...styles["bg-danger"]}} onPress={()=>{handleDeleteTable();setConfirming(null);}}>
                                    <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                                    <Text fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.delete")}</Text>
                                </Pressable>
                            }
                        </View>
                    </View>
                </View>
            }
        </Modal>
    );
}

export default TableSettingsModal;