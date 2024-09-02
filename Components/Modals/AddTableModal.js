import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons, Octicons, Feather } from 'react-native-vector-icons'
import { useDispatch, useSelector } from "react-redux";
import Text from "../Text";
import themes from '../../themes';
import { setAddTableModal } from "../../Store/Modals/modalsSlice";
import { addImportedTable, addNewTable } from "../../Store/Tables/tablesSlice";
import { popup } from "../../helper";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import Input from "../Input";
import { useTranslation } from "react-i18next";

function AddTableModal({tables}) {

    const dispatch = useDispatch();
    const { t } = useTranslation();


    const styles = useSelector(store => store.settings.styles);
    const addTableModal = useSelector(store => store.modals.addTableModal);


    const [isEditingTableTitle,setIsEditingTableTitle] = useState(false);
    const [tableTitleEdit,setTableTitleEdit] = useState(t("tables.untitled"));

    const tableTemplate = {
        name: t("tables.untitled"),
        content: [
            [],
            [],
            [],
            [],
            []
        ]
    }

    
    function handleAddNewTable()
    {
        dispatch(addNewTable(tableTitleEdit));
        // dispatch(updateTables([...tables,{...JSON.parse(JSON.stringify(tableTemplate)),name:tableTitleEdit}]));
        popup("add-table");
    }

    async function importTable()
    {
        let file = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory:true
        });
        let fileContent = await FileSystem.readAsStringAsync(file.assets[0].uri);
        let importedTable = JSON.parse(fileContent);
        dispatch(addImportedTable(importedTable));
        dispatch(setAddTableModal(false));
        setTableTitleEdit(t("tables.untitled"));
        popup("import-table");
    }


    return (
        <Modal visible={addTableModal} animationType='slide' transparent onRequestClose={() => dispatch(setAddTableModal(null))}>
            <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                <View style={{...styles["bg-main"],width:"90%",padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                    <View style={{marginBottom:30}}>
                    {
                        isEditingTableTitle ?
                        <View style={{flexDirection:"column",alignItems:"center",gap:10}}>
                            <Input
                            style={{width:200}}
                            value={tableTitleEdit}
                            onChangeText={(text)=>setTableTitleEdit(text)}
                            />
                            <Pressable
                            style={{backgroundColor:"black",borderRadius:5,padding:5}}
                            onPress={()=>{setIsEditingTableTitle(false);}}>
                                <Text style={{...styles.text,color:"white",fontSize:20}}>{t("tables.confirm")}</Text>
                            </Pressable>
                        </View>
                        :
                        <>
                            <Text style={{...styles.text,fontSize:30,borderColor:"black",borderBottomWidth:2,paddingHorizontal:20}}>{tableTitleEdit}</Text>
                            <Pressable style={{position:"absolute",bottom:-12,right:-10,backgroundColor:"black",borderRadius:20,padding:5}} onPress={()=>{setIsEditingTableTitle(true);}}>
                                <MaterialCommunityIcons name='pencil' size={15} color="white" />
                            </Pressable>
                        </>
                    }
                    </View>

                    <View style={{flexDirection:"column",gap:15,alignItems:"center"}}>
                        <Pressable style={{...styles["button"],...styles["bg-primary"]}} onPress={()=>{
                            handleAddNewTable();
                            dispatch(setAddTableModal(false));
                        }}>
                            <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.add")}</Text>
                        </Pressable>
                        <View style={{...styles["flex-row"],gap:5,alignItems:"center",marginBottom:5}}>
                            <View style={{...styles["border-faint"],width:50,borderWidth:1.25,marginTop:8}}></View>

                            <Text style={{...styles["color-faint"],...styles.text,fontSize:20}}>{t("tables.or")}</Text>

                            <View style={{...styles["border-faint"],width:50,borderWidth:1.25,marginTop:8}}></View>
                        </View>
                        <Pressable style={{...styles["button"],...styles["bg-success"]}} onPress={()=>importTable()}>
                            <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.import")}</Text>
                        </Pressable>
                    </View>

                    <View
                    //style[position:"absolute" top:0 width:"100%"]
                    style={{position:"absolute",top:0,width:"100%",alignItems:"flex-end",paddingTop:15}}
                    >
                        <Pressable style={{padding:5,borderRadius:5,backgroundColor:"black"}} onPress={()=>{
                            dispatch(setAddTableModal(false));
                            setIsEditingTableTitle(false);
                            setTableTitleEdit(t("tables.untitled"));
                            }}>
                            <Feather name="x" size={20} color="white" />
                        </Pressable>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

export default AddTableModal;