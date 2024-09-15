import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons, Octicons, Feather } from 'react-native-vector-icons'
import { useDispatch, useSelector } from "react-redux";
import Text from "../Text";
import themes from '../../themes';
import { deleteTable, editTableTitle, resetTable, setCurrentTable, setTable } from "../../Store/Tables/tablesSlice";
import { setTableSettingsModal } from "../../Store/Modals/modalsSlice";
import { addPeriodNotification, cancelAllNotifications } from "../../notifications";

import * as FileSystem from 'expo-file-system';
import { useTranslation } from "react-i18next";
import { addPopup } from "../../Store/Popups/popupsSlice";
import Button from "../Button";


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

    function popup(text)
    {
        dispatch(addPopup({text:t(`popup.${text}`)}));
    }

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

            let newIndex = tableIndex===currentTable ? null : tableIndex<currentTable ? Math.max(tableIndex-1,0) : currentTable;
            
            if(currentTable === tableIndex)
            {
                await cancelAllNotifications()
                .then(()=>{
                    addTableNotifications(newIndex);
                })
            }

            dispatch(setCurrentTable(newIndex));
            dispatch(deleteTable(tableIndex));

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

    async function disableTable()
    {
        await cancelAllNotifications()
        .then(()=>{
            dispatch(setCurrentTable(null));
            popup("set-table");
        })
    }

    
    function addTableNotifications(tableIndex)
    {
        let targetTable = tables[tableIndex];
        Object.keys(targetTable.content).forEach((day)=>{
                
            targetTable.content[day].forEach(async (period)=>{
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
                                <Button
                                style={{backgroundColor:"black",paddingHorizontal:20}}
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
                                    <Text style={{...styles.text,color:"white",fontSize:20,textAlign:"center"}}>{t("tables.confirm")}</Text>
                                </Button>
                            </View>
                            :
                            <>
                                <Text style={{...styles.text,fontSize:30,borderColor:"black",borderBottomWidth:2,paddingHorizontal:20}}>{tables[tableIndex].name}</Text>

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
                            <Button onPress={()=>setConfirming("delete")} style={{...styles["bg-danger"]}}>
                                <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                                <Text style={{color:"white",fontSize:20}}>{t("tables.delete")}</Text>
                            </Button>
                        }
                        {
                            tableIndex !== currentTable ?
                            <Button onPress={()=>enableTable(tableIndex)} style={{...styles["bg-success"]}}>
                                <MaterialCommunityIcons name="check-circle-outline" color="white" size={30} /> 
                                <Text style={{...styles.text,fontSize:20,color:"white",}}>{t("tables.enable")}</Text>
                            </Button>
                            :
                            <Button onPress={()=>disableTable()} style={{backgroundColor:"gray"}}>
                                <Feather name="x-circle" color="white" size={30} /> 
                                <Text style={{...styles.text,fontSize:20,color:"white",}}>{t("tables.disable")}</Text>
                            </Button>
                            
                        }

                        <Button style={{...styles["bg-primary"]}} onPress={()=>setConfirming("reset")}>
                            <MaterialCommunityIcons name="refresh" color="white" size={30} /> 
                            <Text style={{color:"white",fontSize:20}}>{t("tables.reset")}</Text>
                        </Button>

                        <Button style={{...styles["bg-success"]}} onPress={()=>exportTable()}>
                            <MaterialCommunityIcons name="export" color="white" size={30} /> 
                            <Text style={{color:"white",fontSize:20}}>{t("tables.export")}</Text>
                        </Button>
                    </View>

                    <View
                    //style[position:"absolute" top:0 width:"100%"]
                    style={{position:"absolute",top:0,width:"100%",alignItems:"flex-end",paddingTop:15}}
                    >
                        <Button style={{paddingHorizontal:5,gap:0,backgroundColor:"black"}} onPress={()=>{
                            dispatch(setTableSettingsModal(false));
                            setTableTitleEdit("");
                            setIsEditingTableTitle(false);
                            }}>
                            <Feather name="x" size={20} color="white" />
                        </Button>
                    </View>

                </View>
            </View>
            {
                confirming &&
                <View style={{position:"absolute",top:0,...styles.positionLeft,width:"100%",height:"100%",alignItems:"center",justifyContent:"center",padding:50,backgroundColor:"rgba(0,0,0,0.7)"}}>
                    <View style={{width:"100%",alignItems:"center",backgroundColor:"white",padding:20,borderRadius:5,shadowColor:"black",elevation:5}}>
                        <Text style={{fontSize:25,textTransform:"capitalize"}}>{t(`tables.confirm-${confirming}-title`)}</Text>
                        <Text style={{fontSize:20,marginVertical:20}}>{t(`tables.confirm-${confirming}-message`)}</Text>

                        <View style={{...styles["flex-row"],justifyContent:"space-between",width:"100%"}}>
                            
                            <Button style={{backgroundColor:"gray"}} onPress={()=>setConfirming(null)}>
                                <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.cancel")}</Text>
                            </Button>
                            
                            {
                                confirming==="reset" ?
                                <Button style={{...styles["bg-danger"]}} onPress={()=>{handleResetTable();setConfirming(null);}}>
                                    <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                                    <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.reset")}</Text>
                                </Button>
                                :
                                confirming==="delete" &&
                                <Button style={{...styles["bg-danger"]}} onPress={()=>{handleDeleteTable();setConfirming(null);}}>
                                    <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                                    <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.delete")}</Text>
                                </Button>
                            }
                        </View>
                    </View>
                </View>
            }
        </Modal>
    );
}

export default TableSettingsModal;