import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Octicons, Feather } from 'react-native-vector-icons'
import themes from '../themes';
import NavBar from '../Components/Navbar';
import { useEffect, useState } from 'react';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { useDispatch, useSelector } from 'react-redux';
import store from '../Store/store';
import { setCurrentTable, updateTables } from '../Store/slice/slice';
import { addPeriodNotification, cancelAllNotifications, cancelNotification, editPeriodNotification, periodNotification } from '../notifications';
import LoadingOverlay from '../Components/LoadingOverlay';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as DocumentPicker from 'expo-document-picker';
import SelectDropdown from 'react-native-select-dropdown'
import i18n from '../i18n';
import { addPopup } from '../Store/slice/popupsSlice';
import PopupContainer from '../Components/PopupContainer';
import AppText from '../Components/AppText';

export default function TimetableScreen({navigation}) {

    const styles = useSelector(store => store.settings.styles);
    const currentTheme = useSelector(store => store.settings.theme);
    const currentMinutes = useSelector(store => store.settings.minutes);
    const currentLang = useSelector(store => store.settings.lang);

    const s = 150;
    const dispatch = useDispatch();
    const dayStrings = ["sat","sun","mon","tue","wed","thu"]

    const tableTemplate = {
        name: i18n.t("tables.untitled"),
        content:
        {
            sat: [
    
            ],
            sun: [
    
            ],
            mon: [
    
            ],
            tue: [
    
            ],
            wed: [
    
            ],
            thu: [
    
            ]
        }
    }

    const tables = useSelector(store => store.tables.tables) || [JSON.parse(JSON.stringify(tableTemplate))];
    const currentTable = useSelector(store => store.tables.currentTable);
    const [tableIndex,setTableIndex] = useState(currentTable || 0);

    const colors = themes[currentTheme]["period-colors"];

    const [periodInForm,setPeriodInForm] = useState({
        title: "",
        from: "",
        to: "",
        location: "",
        instructor: ""
    });
    const [periodToView,setPeriodToView] = useState()

    const [dayToAdd,setDayToAdd] = useState();

    const [periodModal,setPeriodModal] = useState(false);
    const [periodModalForm,setPeriodModalForm] = useState("add");

    const [settingsModal,setSettingsModal] = useState(false);

    const [isEditingTableTitle,setIsEditingTableTitle] = useState(false);
    const [tableTitleEdit,setTableTitleEdit] = useState(false);

    const [newTableModal,setNewTableModal] = useState(false);

    const [fromTimePicker,setFromTimePicker] = useState(false);
    const [toTimePicker,setToTimePicker] = useState(false);

    const [existingOptions,setExistingOptions] = useState({
        titles:[],
        times: [],
        instructors: [],
        locations: []
    });

    const [suggestionKey,setSuggestionKey] = useState(null);

    const [confirming,setConfirming] = useState(null);

    const [loading,setLoading] = useState(false);

    function popup(text)
    {
        dispatch(addPopup({text:i18n.t(`popup.${text}`)}));
    }

    function getSuggestions(periodInForm,existingOptions,suggestionKey)
    {
        if(suggestionKey!=="time")
        {
            let inputText = periodInForm[suggestionKey];
            let suggestionsList = existingOptions[suggestionKey+"s"];
            return suggestionsList.filter((suggestion) => inputText==="" || (suggestion.toLowerCase().includes(inputText.toLowerCase()) && suggestion !== inputText));
        }
        else
        {
            return existingOptions["times"];
        }
    }

    function handlePeriodForm(text,property)
    {
        setPeriodInForm({...periodInForm,[property]: text})
    }

    function resetPeriodForm()
    {
        setPeriodInForm({
            index: 0,
            title: "",
            from: "",
            to: "",
            location: "",
            instructor: "",
            day: 0
        });
    }

    async function addPeriod()
    {
        if(periodInForm.title && periodInForm.from && periodInForm.to)
        {
            setLoading(true);
            const newPeriod = {
                ...periodInForm,
                title: periodInForm.title.trim(),
                location: periodInForm.location.trim(),
                instructor: periodInForm.instructor.trim(),
                index:tables[tableIndex].content[dayToAdd].length,
                day: dayStrings.indexOf(dayToAdd)
            };

            if(currentTable === tableIndex) newPeriod.notifId = await addPeriodNotification(newPeriod,currentMinutes,i18n.t("notif"));
            setLoading(false);

            dispatch(updateTables(tables.map((table,index)=>index===tableIndex ? {...table,content: {...table.content,[dayToAdd]:[...table.content[dayToAdd],newPeriod]}    } : table)));
            resetPeriodForm();
            setDayToAdd();
            setPeriodModal(false);
            popup("add-period");

        }
    }

    async function editPeriod()
    {
        if(periodInForm.title && periodInForm.from && periodInForm.to)
        {
            setLoading(true);
            const editedPeriod = {
                ...periodInForm,
                title: periodInForm.title.trim(),
                location: periodInForm.location.trim(),
                instructor: periodInForm.instructor.trim()
            };
            if(currentTable === tableIndex) editedPeriod.notifId = await editPeriodNotification(editedPeriod,currentMinutes,i18n.t("notif"));
            setLoading(false);

            dispatch(updateTables(tables.map((table,index)=>index===tableIndex ? {...table,content: {...table.content,[dayToAdd]:table.content[dayToAdd].map((p,i) => i===periodInForm.index ? editedPeriod : p)}    } : table)));
            resetPeriodForm();
            setDayToAdd();
            setPeriodModal(false);
            popup("edit-period");
        }
    }

    function deletePeriod(period)
    {
        setLoading(true);
        if(currentTable === tableIndex) cancelNotification(period.notifId);
        setLoading(false);
        dispatch(updateTables(tables.map((table,index)=>index===tableIndex ?   {...table,content: {...table.content,[dayStrings[period.day]]:table.content[dayStrings[period.day]].filter((p,i)=>i!==period.index)} } : table)));
        setPeriodToView(undefined);
        popup("delete-period");
    }

    function addNewTable()
    {
        dispatch(updateTables([...tables,{...JSON.parse(JSON.stringify(tableTemplate)),name:tableTitleEdit}]));
        popup("add-table");
    }

    function resetTable()
    {
        setLoading(true);
        dispatch(updateTables(tables.map((table,index)=>index===tableIndex ? JSON.parse(JSON.stringify(tableTemplate)) : table)));
        if(currentTable === tableIndex)
        {
            cancelAllNotifications();
        }
        setLoading(false);
        popup("reset-table");
    }

    async function deleteTable()
    {
        if(tables.length>1)
        {
            setLoading(true);
            setSettingsModal(false);
            dispatch(updateTables(tables.filter((table,index)=>index!==tableIndex)));

            let newIndex = tableIndex>0 ? tableIndex-1 : tableIndex+1;
            if(tableIndex===currentTable) dispatch(setCurrentTable(newIndex));
            setTableIndex(newIndex);
            
            if(currentTable === tableIndex)
            {
                await cancelAllNotifications()
                .then(()=>{
                    addTableNotifications(newIndex);
                })
            }
            setLoading(false);
            popup("delete-table");
        }
    }

    async function enableTable(newTableIndex)
    {
        setLoading(true);
        await cancelAllNotifications()
        .then(()=>{
            setLoading(false);
            dispatch(setCurrentTable(newTableIndex));
            addTableNotifications(newTableIndex);
            popup("set-table");
        })
    }

    async function disableTable()
    {
        setLoading(true);
        await cancelAllNotifications()
        .then(()=>{
            setLoading(false);
            dispatch(setCurrentTable(null));
            popup("set-table");
        })
    }

    function getTimeString(hourString)
    {
        if(!hourString) return "00:00";

        let h = parseInt(hourString.split(":")[0]);
        let m = parseInt(hourString.split(":")[1]);
        let t = h < 12 ? "AM" : "PM";
        
        if(t==="AM")
        {
            if(h===0) h = 12;
        }
        else
        {
            if(h!==12) h %= 12;
        }

        return `${h }:${m<10 ? "0"+m : m} ${t}`;
    }

    function addTableNotifications(tableIndex)
    {
        let targetTable = tables[tableIndex];
        Object.keys(targetTable.content).forEach((day)=>{
                
            targetTable.content[day].forEach(async (period)=>{
                // console.log(period.title,period.day)
                period.notifId = await addPeriodNotification(period,currentMinutes,i18n.t("notif"));
            });
        });
        dispatch(updateTables(prevTables => prevTables.map((t,i) => i===tableIndex ? targetTable : t)));
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

        setSettingsModal(false);
        popup("export-table");
    }

    async function importTable()
    {
        let file = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory:true
        });
        let fileContent = await FileSystem.readAsStringAsync(file.assets[0].uri);
        let importedTable = JSON.parse(fileContent);
        dispatch(updateTables([...tables,importedTable]));
        setNewTableModal(false);
        popup("import-table");
    }


    useEffect(()=>{
        let tempExistingOptions = {titles:[],times:[],instructors:[],locations:[]};
        tables.forEach((table)=>{
            
            Object.keys(table.content).forEach((day)=>{
                
                table.content[day].forEach((period)=>{
                    if(!tempExistingOptions.titles.includes(period.title) && period.title)
                        tempExistingOptions.titles.push(period.title);

                    if(!tempExistingOptions.times.find((t)=>t.from===period.from && t.to===period.to) && period.from && period.to)
                    {
                        tempExistingOptions.times.push({from:period.from,to:period.to})
                    }

                    if(!tempExistingOptions.instructors.includes(period.instructor) && period.instructor)
                        tempExistingOptions.instructors.push(period.instructor);

                    if(!tempExistingOptions.locations.includes(period.location) && period.location)
                        tempExistingOptions.locations.push(period.location);

                });
            });
        });
        tempExistingOptions.titles.sort((a,b)=>a.toLowerCase()>b.toLowerCase() ? 1 : -1);
        tempExistingOptions.times.sort();
        tempExistingOptions.instructors.sort((a,b)=>a.toLowerCase()>b.toLowerCase() ? 1 : -1);
        tempExistingOptions.locations.sort((a,b)=>a.toLowerCase()>b.toLowerCase() ? 1 : -1);
        setExistingOptions(tempExistingOptions);


        

        // let tablesWithUpdatedDays = JSON.parse(JSON.stringify(tables));
        // tablesWithUpdatedDays.forEach((table)=>{
        //     Object.keys(table.content).forEach((day)=>{
        //         table.content[day].forEach((period)=>{
        //             period.day = dayStrings.indexOf(day);
        //             console.log(period.title,period.day)

        //         })
        //     })
        // });
        // dispatch(updateTables(tablesWithUpdatedDays));

    },[tables]);


    return (
        <View style={styles.pageContainer}>
            <View style={{flexDirection:"row",width:"100%",paddingHorizontal:10,paddingBottom:20}}>

                <ScrollView style={{width:"100%",padding:20,paddingBottom:4}} contentContainerStyle={{flexDirection:"row",flexGrow:1,paddingEnd:40,alignItems:"center",gap:20}} horizontal>
                {
                    tables.map((table,index)=>
                    <View style={{flexDirection:"row",alignItems:"center",gap:20,...(tableIndex===index ? styles.tableTabActive : styles.tableTab)}} key={`table-${index}`}>
                        <Pressable onPress={()=>setTableIndex(index)}>
                        {
                            currentTable === index ?
                            <AppText fontFamily={""} style={{...styles.text,fontSize:20,backgroundColor:themes[currentTheme]["current"],color:"white",paddingHorizontal:4,padding:2,borderRadius:5}}>{table.name}</AppText>
                            :
                            <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:tableIndex===index ? "black" : themes[currentTheme]["faint"]}}>{table.name}</AppText>
                        }
                        </Pressable>
                        {
                            tableIndex===index &&
                            <Pressable style={{backgroundColor:"black",borderRadius:5,padding:5}} onPress={()=>{setTableTitleEdit(tables[tableIndex].name);setSettingsModal(true);}}>
                                <MaterialCommunityIcons name='pencil' size={15} color="white" />
                            </Pressable>
                        }
                        
                    </View>
                    )
                }
                    <Pressable style={{backgroundColor:themes[currentTheme]["faint"],borderRadius:5,paddingHorizontal:5,paddingVertical:2,marginBottom:12}} onPress={()=>{setNewTableModal(true);setTableTitleEdit(i18n.t("tables.untitled"));}}>
                        <Octicons name='plus' size={20} color="white" />
                    </Pressable>

                </ScrollView>
            </View>

            <View style={{flex:1,paddingHorizontal:10,paddingBottom:10}}>
                <ScrollView horizontal contentContainerStyle={{flexDirection:"column",flexGrow:1}}>
                    <View style={{flexDirection:"row"}}>
                    {
                        dayStrings.map((day)=>
                        <View style={{width:s,alignItems:"center",paddingBottom:10}} key={`day-tab-${day}`}>
                            <AppText fontFamily={""} style={{...styles.text,fontSize:20,textTransform:"uppercase"}}>{i18n.t(`days.${day}`)}</AppText>
                        </View>
                        )
                    }
                    </View>
                    <ScrollView contentContainerStyle={{flexGrow:1}}>
                        <View style={{flexDirection:"row"}}>
                        {

                            Object.keys(tables[tableIndex].content).map((day,i)=>
                            <View style={{width:s}} key={`table-item-${i}`}>
                                <View style={{width:"100%"}}>

                                    {
                                        tables[tableIndex].content[day].map((period,j) =>
                                        <Pressable
                                        style={{width:"100%",alignItems:"center",justifyContent:"center",height:s,padding:2}}
                                        onPress={()=>{setPeriodToView({...period,index:j});setDayToAdd(day);}}
                                        key={`table-period-${day}-${j}`}>
                                            <View style={{width:"100%",height:"100%",alignItems:"center",justifyContent:"center",backgroundColor:colors[(i*2+j)%colors.length],borderRadius:5,shadowColor:"black",elevation:5}}>
                                                <AppText fontFamily={""} fontWeight={"bold"} style={{textAlign:"center",fontSize:15,margin:5,lineHeight:20}} numberOfLines={3}>{period.title}</AppText>
                                                <AppText fontFamily={""} style={{position:"absolute",top:0,...styles.positionLeft,padding:5,fontSize:10}}>{getTimeString(period.from)} - {getTimeString(period.to)}</AppText>
                                                <AppText fontFamily={""} style={{position:"absolute",bottom:0,...styles.positionLeft,padding:5,fontSize:10}}>{period.location}</AppText>
                                            </View>
                                        </Pressable>
                                        )
                                    }
                                    <View style={{width:"100%"}}>
                                        <Pressable style={{width:"100%",alignItems:"center",justifyContent:"center",height:s,padding:2}} onPress={()=>{setDayToAdd(day);setPeriodModalForm("add");setPeriodModal(true);}}>
                                            <View style={{width:"100%",alignItems:"center",justifyContent:"center",backgroundColor:themes[currentTheme]["period-none"],height:"100%",borderRadius:5,shadowColor:"black",elevation:5}}>
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

            <Modal visible={periodModal} animationType='slide'>
                <ScrollView contentContainerStyle={{flexGrow:1}}>
                    <View style={{backgroundColor:themes[currentTheme]["bg"],width:"100%",justifyContent:"center",alignItems:"center",paddingTop:20}}>
                        <AppText fontFamily={""} style={{...styles.text,fontSize:25}}>{i18n.t(`tables.${periodModalForm}`)} {i18n.t("tables.period")}</AppText>
                        <Pressable style={{position:"absolute",...styles.positionRight,top:0,padding:5,margin:20,borderRadius:5,backgroundColor:"black"}} onPress={()=>{setPeriodModal(false);resetPeriodForm();}}>
                            <Feather name="x" size={20} color="white" />
                        </Pressable>
                    </View>
                    <View style={{backgroundColor:themes[currentTheme]["bg"],height:"100%",padding:50,gap:20,alignItems:"center"}}>
                        <View style={{gap:10,width:"100%"}}>
                            <AppText fontFamily={""} style={{...styles.text,fontSize:20}}>{i18n.t("tables.title")}:</AppText>
                            <TextInput style={{...styles.textInput,fontFamily:""}} value={periodInForm.title} onChangeText={(text)=>handlePeriodForm(text,"title")}/>

                            {
                                getSuggestions(periodInForm,existingOptions,"title").length ?
                                <Pressable style={{position:"absolute",...styles.positionRight,bottom:12,width:45,height:45,alignItems:"center",justifyContent:"center"}} onPress={()=>setSuggestionKey("title")}>
                                    <MaterialIcons name="search" size={25} color={themes[currentTheme]["primary"]} />
                                </Pressable>
                                :
                                null
                            }
                            
                        </View>

                        <View style={{width:"100%",...styles.flexRow,justifyContent:"space-between"}}>
                            <View style={{gap:10,width:"45%"}}>
                                <AppText fontFamily={""} style={{...styles.text,fontSize:20}}>{i18n.t("tables.from")}:</AppText>
                                <TextInput 
                                style={{...styles.textInput,fontFamily:""}}
                                placeholder='00:00'
                                value={getTimeString(periodInForm.from)}
                                onPressIn={()=>setFromTimePicker(true)}
                                />
                            </View>

                            <View style={{gap:10,width:"45%"}}>
                                <AppText fontFamily={""} style={{...styles.text,fontSize:20}}>{i18n.t("tables.to")}:</AppText>
                                <TextInput 
                                style={{...styles.textInput,fontFamily:""}}
                                placeholder='00:00'
                                value={getTimeString(periodInForm.to)}
                                onPressIn={()=>setToTimePicker(true)}
                                />
                                <Pressable style={{position:"absolute",...styles.positionRight,bottom:12,width:45,height:45,alignItems:"center",justifyContent:"center"}} onPress={()=>setSuggestionKey("time")}>
                                    <MaterialIcons name="search" size={25} color={themes[currentTheme]["primary"]} />
                                </Pressable>
                            </View>
                        </View>

                        <View style={{gap:10,width:"100%"}}>
                            <AppText fontFamily={""} style={{...styles.text,fontSize:20}}>{i18n.t("tables.loc")} ({i18n.t("tables.opt")}):</AppText>
                            <TextInput style={{...styles.textInput,fontFamily:""}} value={periodInForm.location} onChangeText={(text)=>handlePeriodForm(text,"location")}/>
                            {
                                getSuggestions(periodInForm,existingOptions,"location").length ?
                                <Pressable style={{position:"absolute",...styles.positionRight,bottom:12,width:45,height:45,alignItems:"center",justifyContent:"center"}} onPress={()=>setSuggestionKey("location")}>
                                    <MaterialIcons name="search" size={25} color={themes[currentTheme]["primary"]} />
                                </Pressable>
                                :
                                null
                            }
                           
                        </View>

                        <View style={{gap:10,width:"100%"}}>
                            <AppText fontFamily={""} style={{...styles.text,fontSize:20}}>{i18n.t("tables.inst")} ({i18n.t("tables.opt")}):</AppText>
                            <TextInput style={{...styles.textInput,fontFamily:""}} value={periodInForm.instructor} onChangeText={(text)=>handlePeriodForm(text,"instructor")}/>
                            {
                                getSuggestions(periodInForm,existingOptions,"instructor").length ?
                                <Pressable style={{position:"absolute",...styles.positionRight,bottom:12,width:45,height:45,alignItems:"center",justifyContent:"center"}} onPress={()=>setSuggestionKey("instructor")}>
                                    <MaterialIcons name="search" size={25} color={themes[currentTheme]["primary"]} />
                                </Pressable>
                                :
                                null
                            }
                        </View>

                        <Pressable style={{padding:5,paddingHorizontal:15,backgroundColor:"black",borderRadius:5,pointerEvents:"auto"}}
                        onPress={()=>{periodModalForm==="add" ? addPeriod() : editPeriod()}}>
                            <AppText fontFamily={""} style={{...styles.text,color:"white",fontSize:25}}>{i18n.t(`tables.${periodModalForm}`)}</AppText>
                        </Pressable>
                        
                    </View>
                </ScrollView>
                {
                    suggestionKey &&
                    <View style={{position:"absolute",height:"100%",width:"100%",padding:50,backgroundColor:"rgba(0,0,0,0.7)",justifyContent:"center",alignItems:"center"}}>
                        <View style={{width:"100%",backgroundColor:"white",padding:5,borderRadius:5,shadowColor:"black",elevation:5}}>
                            <View style={{padding:10}}>
                                <AppText fontFamily={""} style={{fontSize:20}}>{i18n.t("tables.suggestions")}</AppText>

                                <Pressable style={{position:"absolute",top:0,...styles.positionRight,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>setSuggestionKey(null)}>
                                    <Feather name="x" size={20} color="white" />
                                </Pressable>
                            </View>
                            <View style={{width:"100%",borderColor:"black",borderWidth:1,marginTop:5}}></View>
                            <ScrollView style={{height:300}}>
                            {
                                suggestionKey!=="time" ?
                                getSuggestions(periodInForm,existingOptions,suggestionKey).map((suggestion,index)=>

                                <View style={{width:"100%"}} key={`sug-option-${index}`}>
                                    <Pressable style={{width:"100%",padding:10,borderBottomWidth:1,borderColor:"black"}} onPress={()=>{setPeriodInForm({...periodInForm,[suggestionKey]:suggestion});setSuggestionKey(null);}}>
                                        <AppText fontFamily={""} style={{fontSize:20,...styles.textLeft}}>{suggestion}</AppText>
                                    </Pressable>
                                </View>
                                )
                                :
                                getSuggestions(periodInForm,existingOptions,"time").map((suggestion,index)=>

                                <View style={{width:"100%"}} key={`sug-option-${index}`}>
                                    <Pressable style={{width:"100%",padding:10,borderBottomWidth:1,borderColor:"black"}} onPress={()=>{setPeriodInForm({...periodInForm,"from":suggestion.from,"to":suggestion.to});setSuggestionKey(null);}}>
                                        <AppText fontFamily={""} style={{fontSize:20}}>{getTimeString(suggestion.from)} - {getTimeString(suggestion.to)}</AppText>
                                    </Pressable>
                                </View>
                                )
                            }
                            </ScrollView>
                        </View>
                    </View>
                }

                <LoadingOverlay visible={loading} />
            </Modal>

            <Modal visible={periodToView!==undefined} animationType='slide' transparent>

                <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                    <View style={{width:"90%",backgroundColor:themes[currentTheme]["bg"],padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                        {
                            periodToView &&

                            <View style={{alignItems:"center",gap:10,marginBottom:20}}>
                                <AppText fontFamily={""} style={{...styles.text,fontSize:15,color:themes[currentTheme]["faint"]}}>{getTimeString(periodToView.from)} - {getTimeString(periodToView.to)}</AppText>
                                <AppText fontFamily={""} style={{...styles.text,fontSize:40,textAlign:"center",marginBottom:20}}>{periodToView.title}</AppText>
                                {periodToView.location && <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:themes[currentTheme]["faint-2"],textTransform:"capitalize",textAlign:"center"}}>{i18n.t("home.at")}: {periodToView.location}</AppText>}
                                {periodToView.instructor && <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:themes[currentTheme]["faint"],textTransform:"capitalize",textAlign:"center"}}>{i18n.t("home.by")}: {periodToView.instructor}</AppText>}
                            </View>
                        }

                        <View style={{gap:10}}>
                            <Pressable style={{...styles.button,...styles.bgPrimary}} onPress={()=>{setPeriodModalForm("edit");setPeriodInForm(periodToView);setPeriodModal(true);setPeriodToView(undefined);}}>
                                <MaterialCommunityIcons name="pencil-box-outline" color="white" size={30} />
                                <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.edit")}</AppText>
                            </Pressable>

                            <Pressable style={{...styles.button,...styles.bgDanger}} onPress={()=>deletePeriod(periodToView)}>
                                <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                                <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.delete")}</AppText>
                            </Pressable>
                        </View>

                        <Pressable style={{position:"absolute",top:0,...styles.positionRight,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>setPeriodToView(undefined)}>
                            <Feather name="x" size={20} color="white" />
                        </Pressable>

                    </View>
                </View>
                <LoadingOverlay visible={loading} />
            </Modal>

            <Modal visible={settingsModal} animationType='slide' transparent>
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
                                onPress={()=>{if(tableTitleEdit)dispatch(updateTables(tables.map((table,index)=>index===tableIndex ? {...table,name:tableTitleEdit} : table)));setTableTitleEdit("");setIsEditingTableTitle(false);}}>
                                    <AppText fontFamily={""} style={{...styles.text,color:"white",fontSize:20}}>{i18n.t("tables.confirm")}</AppText>
                                </Pressable>
                            </View>
                            :
                            <>
                                <AppText fontFamily={""} style={{...styles.text,fontSize:30,borderColor:"black",borderBottomWidth:2,paddingHorizontal:20}}>{tables[tableIndex].name}</AppText>
                                <Pressable style={{position:"absolute",bottom:-12,right:-10,backgroundColor:"black",borderRadius:20,padding:5}} onPress={()=>{setIsEditingTableTitle(true);setTableTitleEdit(tables[tableIndex].name);}}>
                                    <MaterialCommunityIcons name='pencil' size={15} color="white" />
                                </Pressable>
                            </>
                        }
                        </View>

                        <View style={{flexDirection:"column",gap:20,alignItems:"stretch"}}>
                            {
                                tables.length > 1 &&
                                <Pressable onPress={()=>setConfirming("delete")} style={{...styles.button,...styles.bgDanger}}>
                                    <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                                    <AppText fontFamily={""} style={{color:"white",fontSize:20}}>{i18n.t("tables.delete")}</AppText>
                                </Pressable>
                            }
                            {
                                tableIndex !== currentTable ?
                                <Pressable onPress={()=>enableTable(tableIndex)} style={{...styles.button,...styles.bgSuccess}}>
                                    <MaterialCommunityIcons name="check-circle-outline" color="white" size={30} /> 
                                    <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:"white",}}>{i18n.t("tables.enable")}</AppText>
                                </Pressable>
                                :
                                <Pressable onPress={()=>disableTable()} style={{...styles.button,...styles.bgDanger}}>
                                    <Feather name="x-circle" color="white" size={30} /> 
                                    <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:"white",}}>{i18n.t("tables.disable")}</AppText>
                                </Pressable>
                            }
                            <Pressable style={{...styles.button,...styles.bgPrimary}} onPress={()=>setConfirming("reset")}>
                                <MaterialCommunityIcons name="refresh" color="white" size={30} /> 
                                <AppText fontFamily={""} style={{color:"white",fontSize:20}}>{i18n.t("tables.reset")}</AppText>
                            </Pressable>

                            <Pressable style={{...styles.button,...styles.bgSuccess}} onPress={()=>exportTable()}>
                                <MaterialCommunityIcons name="export" color="white" size={30} /> 
                                <AppText fontFamily={""} style={{color:"white",fontSize:20}}>{i18n.t("tables.export")}</AppText>
                            </Pressable>
                        </View>

                        <Pressable style={{position:"absolute",top:0,...styles.positionRight,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>{setSettingsModal(false);setTableTitleEdit("");setIsEditingTableTitle(false);}}>
                            <Feather name="x" size={20} color="white" />
                        </Pressable>

                    </View>
                </View>
                {
                    confirming &&
                    <View style={{position:"absolute",top:0,...styles.positionLeft,width:"100%",height:"100%",alignItems:"center",justifyContent:"center",padding:50,backgroundColor:"rgba(0,0,0,0.7)"}}>
                        <View style={{width:"100%",alignItems:"center",backgroundColor:"white",padding:20,borderRadius:5,shadowColor:"black",elevation:5}}>
                            <AppText fontFamily={""} style={{fontSize:25,textTransform:"capitalize"}}>{i18n.t(`tables.confirm-${confirming}-title`)}</AppText>
                            <AppText fontFamily={""} style={{fontSize:20,marginVertical:20}}>{i18n.t(`tables.confirm-${confirming}-message`)}</AppText>

                            <View style={{...styles.flexRow,justifyContent:"space-between",width:"100%"}}>
                                <Pressable style={{...styles.button,backgroundColor:"gray"}} onPress={()=>setConfirming(null)}>
                                    <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.cancel")}</AppText>
                                </Pressable>
                                
                                {
                                    confirming==="reset" ?
                                    <Pressable style={{...styles.button,...styles.bgDanger}} onPress={()=>{resetTable();setConfirming(null);}}>
                                        <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                                        <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.reset")}</AppText>
                                    </Pressable>
                                    :
                                    confirming==="delete" ?
                                    <Pressable style={{...styles.button,...styles.bgDanger}} onPress={()=>{deleteTable();setConfirming(null);}}>
                                        <MaterialCommunityIcons name="trash-can-outline" color="white" size={30} />
                                        <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.delete")}</AppText>
                                    </Pressable>
                                    : null
                                }
                            </View>
                        </View>
                    </View>
                }
                <LoadingOverlay visible={loading} />
            </Modal>

            <Modal visible={newTableModal} animationType='slide' transparent>
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
                                    <AppText fontFamily={""} style={{...styles.text,color:"white",fontSize:20}}>{i18n.t("tables.confirm")}</AppText>
                                </Pressable>
                            </View>
                            :
                            <>
                                <AppText fontFamily={""} style={{...styles.text,fontSize:30,borderColor:"black",borderBottomWidth:2,paddingHorizontal:20}}>{tableTitleEdit}</AppText>
                                <Pressable style={{position:"absolute",bottom:-12,right:-10,backgroundColor:"black",borderRadius:20,padding:5}} onPress={()=>{setIsEditingTableTitle(true);}}>
                                    <MaterialCommunityIcons name='pencil' size={15} color="white" />
                                </Pressable>
                            </>
                        }
                        </View>

                        <View style={{flexDirection:"column",gap:15,alignItems:"center"}}>
                            <Pressable style={{...styles.button,...styles.bgPrimary}} onPress={()=>{addNewTable();setNewTableModal(false);}}>
                                <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.add")}</AppText>
                            </Pressable>
                            <View style={{...styles.flexRow,gap:5,alignItems:"center",marginBottom:5}}>
                                <View style={{width:50,borderWidth:1.25,marginTop:8,borderColor:themes[currentTheme]["faint"]}}></View>
                                <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:themes[currentTheme]["faint"]}}>{i18n.t("tables.or")}</AppText>
                                <View style={{width:50,borderWidth:1.25,marginTop:8,borderColor:themes[currentTheme]["faint"]}}></View>
                            </View>
                            <Pressable style={{...styles.button,...styles.bgSuccess}} onPress={()=>importTable()}>
                                <AppText fontFamily={""} style={{...styles.text,fontSize:20,color:"white"}}>{i18n.t("tables.import")}</AppText>
                            </Pressable>
                        </View>

                        <Pressable style={{position:"absolute",top:0,...styles.positionRight,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>{setNewTableModal(false);setIsEditingTableTitle(false);}}>
                            <Feather name="x" size={20} color="white" />
                        </Pressable>

                    </View>
                </View>
                <LoadingOverlay visible={loading} />
            </Modal>

            <DateTimePicker
                isVisible={fromTimePicker}
                mode="time"
                accentColor='red'
                onConfirm={(time)=>{setFromTimePicker(false);setPeriodInForm({...periodInForm,from:time.toTimeString().slice(0,5)})}}
                onCancel={()=>setFromTimePicker(false)}
            />

            <DateTimePicker
                isVisible={toTimePicker}
                mode="time"
                accentColor='red'
                onConfirm={(time)=>{setToTimePicker(false);setPeriodInForm({...periodInForm,to:time.toTimeString().slice(0,5)})}}
                onCancel={()=>setToTimePicker(false)}
            />
            <PopupContainer />
            <StatusBar style="auto"/>
        </View>
    );
}
 
