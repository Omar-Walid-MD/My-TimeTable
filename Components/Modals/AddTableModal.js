import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons, Octicons, Feather } from 'react-native-vector-icons'
import { useDispatch, useSelector } from "react-redux";
import Text from "../Text";
import themes from '../../themes';
import i18n from "../../i18n";
import { setAddTableModal } from "../../Store/Modals/modalsSlice";
import { addImportedTable, addNewTable } from "../../Store/Tables/tablesSlice";
import { popup } from "../../helper";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

function AddTableModal({tables}) {

    const dispatch = useDispatch();

    const styles = useSelector(store => store.settings.styles);
    const currentTheme = useSelector(store => store.settings.theme);
    const addTableModal = useSelector(store => store.modals.addTableModal);


    const [isEditingTableTitle,setIsEditingTableTitle] = useState(false);
    const [tableTitleEdit,setTableTitleEdit] = useState(i18n.t("tables.untitled"));

    const tableTemplate = {
        name: i18n.t("tables.untitled"),
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
        setTableTitleEdit(i18n.t("tables.untitled"));
        popup("import-table");
    }


    return (
        <Modal visible={addTableModal} animationType='slide' transparent>
            <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                <View style={{width:"90%",backgroundColor:themes[currentTheme]["bg"],padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                    <View style={{marginBottom:30}}>
                    {
                        isEditingTableTitle ?
                        <View style={{flexDirection:"column",alignItems:"center",gap:10}}>
                            <TextInput
                            style={{...styles.textInput,fontFamily:"",width:200}}
                            value={tableTitleEdit}
                            onChangeText={(text)=>setTableTitleEdit(text)}
                            />
                            <Pressable
                            style={{backgroundColor:"black",borderRadius:5,padding:5}}
                            onPress={()=>{setIsEditingTableTitle(false);}}>
                                <Text fontFamily={""} style={{...styles.text,color:"white",fontSize:20}}>{i18n.t("tables.confirm")}</Text>
                            </Pressable>
                        </View>
                        :
                        <>
                            <Text fontFamily={""} style={{...styles.text,fontSize:30,borderColor:"black",borderBottomWidth:2,paddingHorizontal:20}}>{tableTitleEdit}</Text>
                            <Pressable style={{position:"absolute",bottom:-12,right:-10,backgroundColor:"black",borderRadius:20,padding:5}} onPress={()=>{setIsEditingTableTitle(true);}}>
                                <MaterialCommunityIcons name='pencil' size={15} color="white" />
                            </Pressable>
                        </>
                    }
                    </View>

                    <View style={{flexDirection:"column",gap:15,alignItems:"center"}}>
                        <Pressable style={{...styles.button,...styles.bgPrimary}} onPress={()=>{
                            handleAddNewTable();
                            dispatch(setAddTableModal(false));
                        }}>
                            <Text fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.add")}</Text>
                        </Pressable>
                        <View style={{...styles.flexRow,gap:5,alignItems:"center",marginBottom:5}}>
                            <View style={{width:50,borderWidth:1.25,marginTop:8,borderColor:themes[currentTheme]["faint"]}}></View>
                            <Text fontFamily={""} style={{...styles.text,fontSize:20,color:themes[currentTheme]["faint"]}}>{i18n.t("tables.or")}</Text>
                            <View style={{width:50,borderWidth:1.25,marginTop:8,borderColor:themes[currentTheme]["faint"]}}></View>
                        </View>
                        <Pressable style={{...styles.button,...styles.bgSuccess}} onPress={()=>importTable()}>
                            <Text fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.import")}</Text>
                        </Pressable>
                    </View>

                    <Pressable style={{position:"absolute",top:0,...styles.positionRight,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>{
                        dispatch(setAddTableModal(false));
                        setIsEditingTableTitle(false);
                        setTableTitleEdit(i18n.t("tables.untitled"));
                        }}>
                        <Feather name="x" size={20} color="white" />
                    </Pressable>

                </View>
            </View>
        </Modal>
    );
}

export default AddTableModal;