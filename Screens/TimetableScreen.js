import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons, Octicons, Feather } from 'react-native-vector-icons'
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

export default function TimetableScreen({navigation}) {

    const styles = useSelector(store => store.theme.styles);
    const currentTheme = useSelector(store => store.theme.theme);

    const s = 150;
    const dispatch = useDispatch();
    const dayStrings = ["sat","sun","mon","tue","wed","thu"]

    const tableTemplate = {
        name: "Untitled",
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
    const [tableIndex,setTableIndex] = useState(0);
    const currentTable = useSelector(store => store.tables.currentTable);

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
        instructors: [],
        locations: []
    });

    const [suggestionKey,setSuggestionKey] = useState(null);

    const [loading,setLoading] = useState(false);

    function getSuggestions(periodInForm,existingOptions,suggestionKey)
    {
        let inputText = periodInForm[suggestionKey];
        let suggestionsList = existingOptions[suggestionKey+"s"]
        return suggestionsList.filter((suggestion) => inputText==="" || (suggestion.toLowerCase().includes(inputText.toLowerCase()) && suggestion !== inputText));
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
            newPeriod.notifId = await addPeriodNotification(newPeriod);

            dispatch(updateTables(tables.map((table,index)=>index===tableIndex ? {...table,content: {...table.content,[dayToAdd]:[...table.content[dayToAdd],newPeriod]}    } : table)));
            resetPeriodForm();
            setDayToAdd();
            setPeriodModal(false);
            setLoading(false);

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
            editedPeriod.notifId = await editPeriodNotification(editedPeriod);

            dispatch(updateTables(tables.map((table,index)=>index===tableIndex ? {...table,content: {...table.content,[dayToAdd]:table.content[dayToAdd].map((p,i) => i===periodInForm.index ? editedPeriod : p)}    } : table)));
            resetPeriodForm();
            setDayToAdd();
            setPeriodModal(false);
            setLoading(false);
        }
    }

    function deletePeriod(period)
    {
        setLoading(true);
        cancelNotification(period.notifId);
        dispatch(updateTables(tables.map((table,index)=>index===tableIndex ?   {...table,content: {...table.content,[dayStrings[period.day]]:table.content[dayStrings[period.day]].filter((p,i)=>i!==period.index)} } : table)));
        setPeriodToView(undefined);
        setLoading(false);
    }

    function addNewTable()
    {
        dispatch(updateTables([...tables,{...JSON.parse(JSON.stringify(tableTemplate)),name:tableTitleEdit}]));
    }

    function resetTable()
    {
        setLoading(true);
        dispatch(updateTables(tables.map((table,index)=>index===tableIndex ? JSON.parse(JSON.stringify(tableTemplate)) : table)));
        if(tableIndex===currentTable)
        {
            cancelAllNotifications();
        }
        setLoading(false);
    }

    function deleteTable()
    {
        if(tables.length>1)
        {
            setLoading(true);
            setSettingsModal(false);
            dispatch(updateTables(tables.filter((table,index)=>index!==tableIndex)));

            let newIndex = tableIndex>0 ? tableIndex-1 : tableIndex+1;
            if(tableIndex===currentTable) dispatch(setCurrentTable(newIndex));
            setTableIndex(newIndex);

            cancelAllNotifications();
            addTableNotifications(newIndex);
            setLoading(false);
        }
    }

    function handleCurrentTable(newTableIndex)
    {
        setLoading(true);
        cancelAllNotifications();
        dispatch(setCurrentTable(newTableIndex));
        addTableNotifications(newTableIndex);
        setLoading(false);
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
                period.notifId = await addPeriodNotification(period);
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
    }


    useEffect(()=>{
        let tempExistingOptions = {titles:[],instructors:[],locations:[]};
        tables.forEach((table)=>{
            
            Object.keys(table.content).forEach((day)=>{
                
                table.content[day].forEach((period)=>{
                    if(!tempExistingOptions.titles.includes(period.title) && period.title)
                        tempExistingOptions.titles.push(period.title);
                    if(!tempExistingOptions.instructors.includes(period.instructor) && period.instructor)
                        tempExistingOptions.instructors.push(period.instructor);
                    if(!tempExistingOptions.locations.includes(period.location) && period.location)
                        tempExistingOptions.locations.push(period.location);

                });
            });
        });
        tempExistingOptions.titles.sort((a,b)=>a.toLowerCase()>b.toLowerCase() ? 1 : -1);
        tempExistingOptions.instructors.sort((a,b)=>a.toLowerCase()>b.toLowerCase() ? 1 : -1);
        tempExistingOptions.locations.sort((a,b)=>a.toLowerCase()>b.toLowerCase() ? 1 : -1);
        setExistingOptions(tempExistingOptions);

    },[tables])

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
                            <Text style={{...styles.text,fontSize:20,backgroundColor:themes[currentTheme]["success"],color:"white",paddingHorizontal:4,padding:2,borderRadius:5}}>{table.name}</Text>
                            :
                            <Text style={{...styles.text,fontSize:20,color:tableIndex===index ? "black" : themes[currentTheme]["faint"]}}>{table.name}</Text>
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
                    <Pressable style={{backgroundColor:themes[currentTheme]["faint"],borderRadius:5,paddingHorizontal:5,paddingVertical:2,marginBottom:12}} onPress={()=>{setNewTableModal(true);setTableTitleEdit("Untitled");}}>
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
                            <Text style={{...styles.text,fontSize:20,textTransform:"uppercase"}}>{day}</Text>
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
                                                <Text style={{textAlign:"center",fontSize:15,fontWeight:"bold",margin:5}} numberOfLines={3}>{period.title}</Text>
                                                <Text style={{position:"absolute",top:0,left:0,padding:5,fontSize:10}}>{getTimeString(period.from)} - {getTimeString(period.to)}</Text>
                                                <Text style={{position:"absolute",bottom:0,left:0,padding:5,fontSize:10}}>{period.location}</Text>
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
                    <View style={{backgroundColor:themes[currentTheme]["bg"],width:"100%",flexDirection:"row",justifyContent:"center",alignItems:"center",paddingTop:20}}>
                        <Text style={{...styles.text,fontSize:25}}>{periodModalForm==="add" ? "Add" : "Edit"} Period</Text>
                        <Pressable style={{position:"absolute",right:0,top:0,padding:5,margin:20,borderRadius:5,backgroundColor:"black"}} onPress={()=>{setPeriodModal(false);resetPeriodForm();}}>
                            <Feather name="x" size={20} color="white" />
                        </Pressable>
                    </View>
                    <View style={{backgroundColor:themes[currentTheme]["bg"],height:"100%",padding:50,gap:20,alignItems:"center"}}>
                        <View style={{gap:10,width:"100%"}}>
                            <Text style={{...styles.text,fontSize:20}}>Title:</Text>
                            <TextInput style={styles.textInput} value={periodInForm.title} onChangeText={(text)=>handlePeriodForm(text,"title")}/>

                            {
                                getSuggestions(periodInForm,existingOptions,"title").length ?
                                <Pressable style={{position:"absolute",top:"56%",right:10}} onPress={()=>setSuggestionKey("title")}>
                                    <Text style={{fontSize:12.5,...styles.colorPrimary}}>Suggestions</Text>
                                </Pressable>
                                :
                                null
                            }
                            
                        </View>

                        <View style={{width:"100%",flexDirection:"row",justifyContent:"space-between"}}>
                            <View style={{gap:10,width:"45%"}}>
                                <Text style={{...styles.text,fontSize:20}}>From:</Text>
                                <TextInput 
                                style={styles.textInput}
                                placeholder='00:00'
                                value={getTimeString(periodInForm.from)}
                                onPressIn={()=>setFromTimePicker(true)}
                                />
                            </View>

                            <View style={{gap:10,width:"45%"}}>
                                <Text style={{...styles.text,fontSize:20}}>To:</Text>
                                <TextInput 
                                style={styles.textInput}
                                placeholder='00:00'
                                value={getTimeString(periodInForm.to)}
                                onPressIn={()=>setToTimePicker(true)}
                                />
                            </View>
                        </View>

                        <View style={{gap:10,width:"100%"}}>
                            <Text style={{...styles.text,fontSize:20}}>Location (optional):</Text>
                            <TextInput style={styles.textInput} value={periodInForm.location} onChangeText={(text)=>handlePeriodForm(text,"location")}/>
                            {
                                getSuggestions(periodInForm,existingOptions,"location").length ?
                                <Pressable style={{position:"absolute",top:"56%",right:10}} onPress={()=>setSuggestionKey("location")}>
                                    <Text style={{fontSize:12.5,...styles.colorPrimary}}>Suggestions</Text>
                                </Pressable>
                                :
                                null
                            }
                           
                        </View>

                        <View style={{gap:10,width:"100%"}}>
                            <Text style={{...styles.text,fontSize:20}}>Instructor (optional):</Text>
                            <TextInput style={styles.textInput} value={periodInForm.instructor} onChangeText={(text)=>handlePeriodForm(text,"instructor")}/>
                            {
                                getSuggestions(periodInForm,existingOptions,"instructor").length ?
                                <Pressable style={{position:"absolute",top:"56%",right:10}} onPress={()=>setSuggestionKey("instructor")}>
                                    <Text style={{fontSize:12.5,...styles.colorPrimary}}>Suggestions</Text>
                                </Pressable>
                                :
                                null
                            }
                        </View>

                        <Pressable style={{padding:5,paddingHorizontal:15,backgroundColor:"black",borderRadius:5,pointerEvents:"auto"}}
                        onPress={()=>{periodModalForm==="add" ? addPeriod() : editPeriod()}}>
                            <Text style={{...styles.text,color:"white",fontSize:25}}>{periodModalForm==="add" ? "Add" : "Edit"}</Text>
                        </Pressable>
                        
                    </View>
                </ScrollView>
                {
                    suggestionKey &&
                    <View style={{position:"absolute",height:"100%",width:"100%",padding:50,backgroundColor:"rgba(0,0,0,0.7)",justifyContent:"center",alignItems:"center"}}>
                        <View style={{width:"100%",backgroundColor:"white",padding:5,borderRadius:5,shadowColor:"black",elevation:5}}>
                            <View style={{padding:10}}>
                                <Text style={{fontSize:20}}>Suggestions</Text>

                                <Pressable style={{position:"absolute",top:0,right:0,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>setSuggestionKey(null)}>
                                    <Feather name="x" size={20} color="white" />
                                </Pressable>
                            </View>
                            <View style={{width:"100%",borderColor:"black",borderWidth:1,marginTop:5}}></View>
                            <ScrollView style={{height:300}}>
                            {
                                getSuggestions(periodInForm,existingOptions,suggestionKey).map((suggestion,index)=>

                                <View style={{width:"100%"}} key={`sug-option-${index}`}>
                                    <Pressable style={{width:"100%",padding:10,borderBottomWidth:1,borderColor:"black"}} onPress={()=>{setPeriodInForm({...periodInForm,[suggestionKey]:suggestion});setSuggestionKey(null);}}>
                                        <Text>{suggestion}</Text>
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

                            <View style={{alignItems:"center",gap:10,marginBottom:50}}>
                                <Text style={{...styles.text,fontSize:15,color:themes[currentTheme]["faint"]}}>{getTimeString(periodToView.from)} - {getTimeString(periodToView.to)}</Text>
                                <Text style={{...styles.text,fontSize:40,marginBottom:20}}>{periodToView.title}</Text>
                                {periodToView.location && <Text style={{...styles.text,fontSize:20,color:themes[currentTheme]["faint-2"],textTransform:"capitalize"}}>At: {periodToView.location}</Text>}
                                {periodToView.instructor && <Text style={{...styles.text,fontSize:20,color:themes[currentTheme]["faint"],textTransform:"capitalize"}}>By: {periodToView.instructor}</Text>}
                            </View>
                        }

                        <View style={{flexDirection:"row",gap:100}}>
                            <Pressable style={{...styles.button,...styles.borderDanger}} onPress={()=>deletePeriod(periodToView)}>
                                <Text style={{...styles.text,fontSize:20,...styles.colorDanger}}>Delete</Text>
                            </Pressable>

                            <Pressable style={{...styles.button,...styles.borderPrimary}} onPress={()=>{setPeriodModalForm("edit");setPeriodInForm(periodToView);setPeriodModal(true);setPeriodToView(undefined);}}>
                                <Text style={{...styles.text,fontSize:20,...styles.colorPrimary}}>Edit</Text>
                            </Pressable>
                        </View>

                        <Pressable style={{position:"absolute",top:0,right:0,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>setPeriodToView(undefined)}>
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
                                style={{...styles.textInput,width:200}}
                                value={tableTitleEdit}
                                onChangeText={(text)=>setTableTitleEdit(text)}
                                />
                                <Pressable
                                style={{backgroundColor:"black",borderRadius:5,padding:5}}
                                onPress={()=>{if(tableTitleEdit)dispatch(updateTables(tables.map((table,index)=>index===tableIndex ? {...table,name:tableTitleEdit} : table)));setTableTitleEdit("");setIsEditingTableTitle(false);}}>
                                    <Text style={{...styles.text,color:"white",fontSize:20}}>Confirm</Text>
                                </Pressable>
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

                        <View style={{flexDirection:"column",gap:20,alignItems:"center"}}>
                            {
                                tables.length > 1 &&
                                <Pressable onPress={()=>deleteTable()} style={{...styles.button,...styles.borderDanger}}>
                                    <Text style={{...styles.text,fontSize:20,...styles.colorDanger}}>Delete</Text>
                                </Pressable>
                            }
                            {
                                tableIndex !== currentTable &&
                                <Pressable onPress={()=>handleCurrentTable(tableIndex)}>
                                    <Text style={{...styles.text,fontSize:20,color:"white",backgroundColor:themes[currentTheme]["success"],padding:5,borderRadius:5}}>Set Current</Text>
                                </Pressable>
                            }
                            <Pressable style={{...styles.button,...styles.borderPrimary}} onPress={()=>resetTable()}>
                                <Text style={{...styles.text,fontSize:20,...styles.colorPrimary}}>Reset</Text>
                            </Pressable>

                            <Pressable style={{...styles.button,...styles.borderSuccess}} onPress={()=>exportTable()}>
                                <Text style={{...styles.text,fontSize:20,...styles.colorSuccess}}>Export</Text>
                            </Pressable>
                        </View>

                        <Pressable style={{position:"absolute",top:0,right:0,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>{setSettingsModal(false);setTableTitleEdit("");setIsEditingTableTitle(false);}}>
                            <Feather name="x" size={20} color="white" />
                        </Pressable>

                    </View>
                </View>
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
                                style={{...styles.textInput,width:200}}
                                value={tableTitleEdit}
                                onChangeText={(text)=>setTableTitleEdit(text)}
                                />
                                <Pressable
                                style={{backgroundColor:"black",borderRadius:5,padding:5}}
                                onPress={()=>{setIsEditingTableTitle(false);}}>
                                    <Text style={{...styles.text,color:"white",fontSize:20}}>Confirm</Text>
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
                            <Pressable style={{...styles.button,...styles.borderPrimary}} onPress={()=>{addNewTable();setNewTableModal(false);}}>
                                <Text style={{...styles.text,fontSize:20,...styles.colorPrimary}}>Add</Text>
                            </Pressable>
                            <View style={{flexDirection:"row",gap:5,alignItems:"center",marginBottom:5}}>
                                <View style={{width:50,borderWidth:1.25,marginTop:8,borderColor:themes[currentTheme]["faint"]}}></View>
                                <Text style={{...styles.text,fontSize:20,color:themes[currentTheme]["faint"]}}>or</Text>
                                <View style={{width:50,borderWidth:1.25,marginTop:8,borderColor:themes[currentTheme]["faint"]}}></View>
                            </View>
                            <Pressable style={{...styles.button,...styles.borderSuccess}} onPress={()=>importTable()}>
                                <Text style={{...styles.text,fontSize:20,...styles.colorSuccess}}>Import</Text>
                            </Pressable>
                        </View>

                        <Pressable style={{position:"absolute",top:0,right:0,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>{setNewTableModal(false);setIsEditingTableTitle(false);}}>
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
            <StatusBar style="auto"/>
        </View>
    );
}
 
