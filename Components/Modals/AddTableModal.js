import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { MaterialCommunityIcons, Octicons, Feather } from 'react-native-vector-icons'
import { useDispatch, useSelector } from "react-redux";
import Text from "../Text";

import { setAddTableModal } from "../../Store/Modals/modalsSlice";
import { addImportedTable, addNewTable } from "../../Store/Tables/tablesSlice";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import Input from "../Input";
import { useTranslation } from "react-i18next";
import { addPopup } from "../../Store/Popups/popupsSlice";
import Button from "../Button";
import * as yup from "yup";

const tableSchema = yup.object().shape({
    name: yup.string().required(),
    content: yup.array().of(
        yup.array().of(
            yup.object().shape({
                index: yup.number().required(),

                title: yup.string().required(),
                from: yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
                to: yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
                location: yup.string(),
                instructor: yup.string(),

                day: yup.number().required(),
                notifId: yup.string()
            })
        )
    ).length(6)
  })

  

function AddTableModal({}) {

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const styles = useSelector(store => store.settings.styles);
    const addTableModal = useSelector(store => store.modals.addTableModal);

    const [isEditingTableTitle,setIsEditingTableTitle] = useState(false);
    const [tableTitleEdit,setTableTitleEdit] = useState(t("tables.untitled"));

    function popup(text,state="success")
    {

        dispatch(addPopup({text:t(`popup.${text}`),state}));
    }

    
    function handleAddNewTable()
    {
        dispatch(addNewTable(tableTitleEdit));
        popup("add-table");
    }

    async function importTable()
    {
        let file = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory:true
        });
        let fileContent = await FileSystem.readAsStringAsync(file.assets[0].uri);
        let importedTable = JSON.parse(fileContent);

        tableSchema.validate(importedTable)
        .then(() => {
            dispatch(addImportedTable(importedTable));
            dispatch(setAddTableModal(false));
            setTableTitleEdit(t("tables.untitled"));
            dispatch(setAddTableModal(null));
            popup("import-table");
        }).catch((err) => {
            dispatch(setAddTableModal(null));
            popup("invalid-import-table","failed");
        });


        
    }


    return (
        <Modal visible={addTableModal} animationType='slide' transparent onRequestClose={() => dispatch(setAddTableModal(null))}>
            <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                <View style={{...styles["bg-white"],width:"90%",padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

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
                            style={{backgroundColor:"black",gap:0,paddingHorizontal:30}}
                            onPress={()=>{setIsEditingTableTitle(false);}}>
                                <Text style={{...styles.text,color:"white",fontSize:20}}>{t("tables.confirm")}</Text>
                            </Button>
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
                        <Button style={{...styles["bg-primary"]}} onPress={()=>{
                            handleAddNewTable();
                            dispatch(setAddTableModal(false));
                        }}>
                            <Octicons name='plus' size={20} color="white" />
                            <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.add")}</Text>
                        </Button>
                        <View style={{...styles["flex-row"],gap:5,alignItems:"center",marginBottom:5}}>
                            <View style={{...styles["bg-faint"],width:50,height:2,marginTop:8}}></View>

                            <Text style={{...styles["color-faint"],fontSize:20}}>{t("tables.or")}</Text>

                            <View style={{...styles["bg-faint"],width:50,height:2,marginTop:8}}></View>
                        </View>
                        <Button style={{...styles["bg-success"]}} onPress={()=>importTable()}>
                            <MaterialCommunityIcons name="export" color="white" size={30} /> 
                            <Text style={{...styles.text,fontSize:20,color:"white"}}>{t("tables.import")}</Text>
                        </Button>
                    </View>

                    <View
                    //style[position:"absolute" top:0 width:"100%"]
                    style={{position:"absolute",top:0,width:"100%",alignItems:"flex-end",paddingTop:15}}
                    >
                        <Button style={{paddingHorizontal:5,gap:0,backgroundColor:"black"}} onPress={()=>{
                            dispatch(setAddTableModal(false));
                            setIsEditingTableTitle(false);
                            setTableTitleEdit(t("tables.untitled"));
                            }}>
                            <Feather name="x" size={20} color="white" />
                        </Button>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

export default AddTableModal;