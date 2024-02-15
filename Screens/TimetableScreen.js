import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons, Octicons, Feather } from 'react-native-vector-icons'
import styles from '../styles';
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

export default function TimetableScreen({navigation}) {

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

    const colors = ["rgb(255,255,200)","rgb(200,255,255)","rgb(200,255,200)","rgb(255,220,220)"]

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

    const [suggestionBoxes,setSuggestionBoxes] = useState({titles:false});

    const [loading,setLoading] = useState(false);

    function getSuggestions(inputText,suggestionsList)
    {
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
            // setLoading(true);
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
        // console.log(file.assets[0])
        let fileContent = await FileSystem.readAsStringAsync(file.assets[0].uri);
        let importedTable = JSON.parse(fileContent);
        dispatch(updateTables([...tables,importedTable]));
        setNewTableModal(false);
    }



    // useEffect(()=>{
    //     let tempExistingOptions = {titles:[],instructors:[],locations:[]};
    //     tables.forEach((table)=>{
            
    //         Object.keys(table.content).forEach((day)=>{
                
    //             table.content[day].forEach((period)=>{
    //                 if(!tempExistingOptions.titles.includes(period.title) && period.title)
    //                     tempExistingOptions.titles.push(period.title);
    //                 if(!tempExistingOptions.instructors.includes(period.instructor) && period.instructor)
    //                     tempExistingOptions.instructors.push(period.instructor);
    //                 if(!tempExistingOptions.locations.includes(period.location) && period.location)
    //                     tempExistingOptions.locations.push(period.location);

    //             });
    //         });
    //     });
    //     setExistingOptions(tempExistingOptions);

    // },[tables])

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
                            <Text style={{fontSize:20,backgroundColor:"#239623",color:"white",paddingHorizontal:4,padding:2,borderRadius:5}}>{table.name}</Text>
                            :
                            <Text style={{fontSize:20,color:tableIndex===index ? "black" : "#87A087"}}>{table.name}</Text>
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
                    <Pressable style={{backgroundColor:"#87A087",borderRadius:5,paddingHorizontal:5,paddingVertical:2,marginBottom:12}} onPress={()=>{setNewTableModal(true);setTableTitleEdit("Untitled");}}>
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
                            <Text style={{fontSize:20,textTransform:"uppercase"}}>{day}</Text>
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
                                                <Text style={{textAlign:"center",fontSize:20}}>{period.title}</Text>
                                                <Text style={{position:"absolute",top:0,left:0,padding:5}}>{getTimeString(period.from)} - {getTimeString(period.to)}</Text>
                                                <Text style={{position:"absolute",bottom:0,left:0,padding:5}}>{period.location}</Text>
                                            </View>
                                        </Pressable>
                                        )
                                    }
                                    <View style={{width:"100%"}}>
                                        <Pressable style={{width:"100%",alignItems:"center",justifyContent:"center",height:s,padding:2}} onPress={()=>{setDayToAdd(day);setPeriodModalForm("add");setPeriodModal(true);}}>
                                            <View style={{width:"100%",alignItems:"center",justifyContent:"center",backgroundColor:"rgb(120,120,120)",height:"100%",borderRadius:5,shadowColor:"black",elevation:5}}>
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
                <Pressable style={{position:"absolute",width:"100%",height:"100%",zIndex:-1}} onPress={()=>{setSuggestionBoxes({titles:false,locations:false,instructors:false});}}></Pressable>
                <View style={{backgroundColor:"#F5FAF5",width:"100%",flexDirection:"row",justifyContent:"center",alignItems:"center",paddingTop:20}}>
                    <Text style={{fontSize:25}}>{periodModalForm==="add" ? "Add" : "Edit"} Period</Text>
                    <Pressable style={{position:"absolute",right:0,top:0,padding:5,margin:20,borderRadius:5,backgroundColor:"black",pointerEvents:"auto"}} onPress={()=>{setSuggestionBoxes({titles:false,locations:false,instructors:false});setPeriodModal(false);resetPeriodForm();}}>
                        <Feather name="x" size={20} color="white" />
                    </Pressable>
                </View>
                <View style={{backgroundColor:"#F5FAF5",height:"100%",padding:50,gap:20,alignItems:"center"}}>
                    <View style={{gap:10,width:"100%"}}>
                        <Text style={{fontSize:20}}>Title:</Text>
                        <TextInput style={styles.textInput} value={periodInForm.title} onChangeText={(text)=>handlePeriodForm(text,"title")}
                        onFocus={()=>setSuggestionBoxes({...suggestionBoxes,titles:true})}

                        // onBlur={()=>{setTimeout(() => {
                        //     setSuggestionBoxes(s => ({...s,titles:false}));
                        // }, 200);
                        // }}
                        />
                        {
                            suggestionBoxes.titles && getSuggestions(periodInForm.title,existingOptions.titles).length  ?
                            <>
                                <View>
                                    <Text>Suggestions:</Text>
                                </View>
                                <View style={{width:"100%",backgroundColor:"white",borderWidth:2,borderColor:"black",borderRadius:5,padding:10}}>
                                    <ScrollView >
                                    {
                                        getSuggestions(periodInForm.title,existingOptions.titles).map((titleSuggestion,index)=>
                                        <View style={{width:"100%"}} key={`sug-title-${index}`}>
                                            <Pressable style={{width:"100%",padding:2,pointerEvents:"auto"}} onPress={()=>setPeriodInForm({...periodInForm,title:titleSuggestion})}>
                                                <Text>{titleSuggestion}</Text>
                                            </Pressable>
                                        </View>
                                        )
                                    }
                                    </ScrollView>
                                </View>
                            </>
                            :
                            null
                        }
                    </View>

                    <View style={{width:"100%",flexDirection:"row",justifyContent:"space-between"}}>
                        <View style={{gap:10,width:"45%"}}>
                            <Text style={{fontSize:20}}>From:</Text>
                            <TextInput 
                            style={styles.textInput}
                            placeholder='00:00'
                            value={getTimeString(periodInForm.from)}
                            // onChangeText={(text)=>handlePeriodForm(text,"from")}
                            onPressIn={()=>setFromTimePicker(true)}
                            />
                        </View>

                        <View style={{gap:10,width:"45%"}}>
                            <Text style={{fontSize:20}}>To:</Text>
                            <TextInput 
                            style={styles.textInput}
                            placeholder='00:00'
                            value={getTimeString(periodInForm.to)}
                            // onChangeText={(text)=>handlePeriodForm(text,"to")}
                            onPressIn={()=>setToTimePicker(true)}
                            />
                        </View>
                    </View>

                    <View style={{gap:10,width:"100%"}}>
                        <Text style={{fontSize:20}}>Location (optional):</Text>
                        <TextInput style={{...styles.textInput}} value={periodInForm.location} onChangeText={(text)=>handlePeriodForm(text,"location")}
                        onFocus={()=>setSuggestionBoxes({...suggestionBoxes,locations:true})}
                        // onBlur={()=>{setTimeout(() => {
                        //     setSuggestionBoxes(s => ({...s,locations:false}));
                        // }, 200);
                        // }}
                        />
                    
                        {
                            suggestionBoxes.locations && getSuggestions(periodInForm.location,existingOptions.locations).length ?
                            <>
                                <View>
                                    <Text>Suggestions:</Text>
                                </View>
                                <View style={{width:"100%",backgroundColor:"white",borderWidth:2,borderColor:"black",borderRadius:5,padding:10}}>
                                    <ScrollView >
                                    {
                                        getSuggestions(periodInForm.location,existingOptions.locations).map((locationSuggestion,index)=>
                                        <View style={{width:"100%"}} key={`sug-loc-${index}`}>
                                            <Pressable style={{width:"100%",padding:2,pointerEvents:"auto"}} onPress={()=>setPeriodInForm({...periodInForm,location:locationSuggestion})}>
                                                <Text>{locationSuggestion}</Text>
                                            </Pressable>
                                        </View>
                                        )
                                    }
                                    </ScrollView>
                                </View>
                            </>
                            :
                            null
                        }
                    </View>

                    <View style={{gap:10,width:"100%"}}>
                        <Text style={{fontSize:20}}>Instructor (optional):</Text>
                        <TextInput style={{...styles.textInput}} value={periodInForm.instructor} onChangeText={(text)=>handlePeriodForm(text,"instructor")}
                        onFocus={()=>setSuggestionBoxes({...suggestionBoxes,instructors:true})}
                        // onBlur={()=>{setTimeout(() => {
                        //     setSuggestionBoxes(s => ({...s,instructors:false}));
                        // }, 200);
                        // }}
                        />
                    
                        {
                            suggestionBoxes.instructors && getSuggestions(periodInForm.instructor,existingOptions.instructors).length ?
                            <>
                                <View>
                                    <Text>Suggestions:</Text>
                                </View>
                                <View style={{width:"100%",backgroundColor:"white",borderWidth:2,borderColor:"black",borderRadius:5,padding:10}}>
                                    <ScrollView >
                                    {
                                        getSuggestions(periodInForm.instructor,existingOptions.instructors).map((instructorSuggestion,index)=>
                                        <View style={{width:"100%"}} key={`sug-ins-${index}`}>
                                            <Pressable style={{width:"100%",padding:2,pointerEvents:"auto"}} onPress={()=>setPeriodInForm({...periodInForm,instructor:instructorSuggestion})}>
                                                <Text>{instructorSuggestion}</Text>
                                            </Pressable>
                                        </View>
                                        )
                                    }
                                    </ScrollView>
                                </View>
                            </>
                            :
                            null
                        }
                    </View>

                    <Pressable style={{padding:5,paddingHorizontal:15,backgroundColor:"black",borderRadius:5,pointerEvents:"auto"}}
                    onPress={()=>{
                        setSuggestionBoxes({titles:false,locations:false,instructors:false});
                        periodModalForm==="add" ? addPeriod() : editPeriod()
                    }}>
                        <Text style={{color:"white",fontSize:25}}>{periodModalForm==="add" ? "Add" : "Edit"}</Text>
                    </Pressable>
                </View>
                <LoadingOverlay visible={loading} />
            </Modal>

            <Modal visible={periodToView!==undefined} animationType='slide' transparent>
                <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                    <View style={{width:"90%",backgroundColor:"#F5FAF5",padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                        {
                            periodToView &&

                            <View style={{alignItems:"center",gap:10,marginBottom:50}}>
                                <Text style={{fontSize:15,color:"#87A087"}}>{getTimeString(periodToView.from)} - {getTimeString(periodToView.to)}</Text>
                                <Text style={{fontSize:40,marginBottom:20}}>{periodToView.title}</Text>
                                {periodToView.location && <Text style={{fontSize:20,color:"#647864",textTransform:"capitalize"}}>At: {periodToView.location}</Text>}
                                {periodToView.instructor && <Text style={{fontSize:20,color:"#87A087",textTransform:"capitalize"}}>By: {periodToView.instructor}</Text>}
                            </View>
                        }

                        <View style={{flexDirection:"row",gap:100}}>
                            <Pressable style={{padding:5,borderRadius:5,borderWidth:2,borderColor:"rgb(200,0,0)",justifyContent:"center",alignItems:"center"}} onPress={()=>deletePeriod(periodToView)}>
                                <Text style={{fontSize:20,color:"rgb(200,0,0)"}}>Delete</Text>
                            </Pressable>

                            <Pressable style={{padding:5,borderRadius:5,borderWidth:2,borderColor:"rgb(0,140,180)",justifyContent:"center",alignItems:"center"}} onPress={()=>{setPeriodModalForm("edit");setPeriodInForm(periodToView);setPeriodModal(true);setPeriodToView(undefined);}}>
                                <Text style={{fontSize:20,color:"rgb(0,140,180)"}}>Edit</Text>
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
                    <View style={{width:"90%",backgroundColor:"#F5FAF5",padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                        <View style={{marginBottom:50}}>
                        {
                            isEditingTableTitle ?
                            <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
                                <TextInput
                                style={styles.textInput}
                                value={tableTitleEdit}
                                onChangeText={(text)=>setTableTitleEdit(text)}
                                />
                                <Pressable
                                style={{backgroundColor:"black",borderRadius:5,padding:5}}
                                onPress={()=>{dispatch(updateTables(tables.map((table,index)=>index===tableIndex ? {...table,name:tableTitleEdit} : table)));setTableTitleEdit("");setIsEditingTableTitle(false);}}>
                                    <Text style={{color:"white",fontSize:20}}>Confirm</Text>
                                </Pressable>
                            </View>
                            :
                            <>
                                <Text style={{fontSize:30,borderColor:"black",borderBottomWidth:2,paddingHorizontal:20}}>{tables[tableIndex].name}</Text>
                                <Pressable style={{position:"absolute",bottom:-12,right:-10,backgroundColor:"black",borderRadius:20,padding:5}} onPress={()=>{setIsEditingTableTitle(true);setTableTitleEdit(tables[tableIndex].name);}}>
                                    <MaterialCommunityIcons name='pencil' size={15} color="white" />
                                </Pressable>
                            </>
                        }
                        </View>

                        <View style={{flexDirection:"column",gap:20,alignItems:"center"}}>
                            {
                                tables.length > 1 &&
                                <Pressable onPress={()=>deleteTable()} style={{padding:5,borderRadius:5,borderWidth:2,borderColor:"rgb(200,0,0)",justifyContent:"center",alignItems:"center"}}>
                                    <Text style={{fontSize:20,color:"rgb(200,0,0)"}}>Delete</Text>
                                </Pressable>
                            }
                            {
                                tableIndex !== currentTable &&
                                <Pressable onPress={()=>handleCurrentTable(tableIndex)}>
                                    <Text style={{fontSize:20,color:"white",backgroundColor:"#239623",padding:5,borderRadius:5}}>Set Current</Text>
                                </Pressable>
                            }
                            <Pressable style={{padding:5,borderRadius:5,borderWidth:2,borderColor:"rgb(0,140,180)",justifyContent:"center",alignItems:"center"}} onPress={()=>resetTable()}>
                                <Text style={{fontSize:20,color:"rgb(0,140,180)"}}>Reset</Text>
                            </Pressable>

                            <Pressable style={{padding:5,borderRadius:5,borderWidth:2,borderColor:"#239623",justifyContent:"center",alignItems:"center"}} onPress={()=>exportTable()}>
                                <Text style={{fontSize:20,color:"#239623"}}>Export</Text>
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
                    <View style={{width:"90%",backgroundColor:"#F5FAF5",padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                        <View style={{marginBottom:50}}>
                        {
                            isEditingTableTitle ?
                            <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
                                <TextInput
                                style={styles.textInput}
                                value={tableTitleEdit}
                                onChangeText={(text)=>setTableTitleEdit(text)}
                                />
                                <Pressable
                                style={{backgroundColor:"black",borderRadius:5,padding:5}}
                                onPress={()=>{setIsEditingTableTitle(false);}}>
                                    <Text style={{color:"white",fontSize:20}}>Confirm</Text>
                                </Pressable>
                            </View>
                            :
                            <>
                                <Text style={{fontSize:30,borderColor:"black",borderBottomWidth:2,paddingHorizontal:20}}>{tableTitleEdit}</Text>
                                <Pressable style={{position:"absolute",bottom:-12,right:-10,backgroundColor:"black",borderRadius:20,padding:5}} onPress={()=>{setIsEditingTableTitle(true);}}>
                                    <MaterialCommunityIcons name='pencil' size={15} color="white" />
                                </Pressable>
                            </>
                        }
                        </View>

                        <View style={{flexDirection:"column",gap:20,alignItems:"center"}}>
                            <Pressable style={{padding:5,borderRadius:5,borderWidth:2,borderColor:"rgb(0,140,180)",justifyContent:"center",alignItems:"center"}} onPress={()=>{addNewTable();setNewTableModal(false);}}>
                                <Text style={{fontSize:20,color:"rgb(0,140,180)"}}>Add</Text>
                            </Pressable>
                            <View>
                                <Text>or</Text>
                            </View>
                            <Pressable style={{padding:5,borderRadius:5,borderWidth:2,borderColor:"#239623",justifyContent:"center",alignItems:"center"}} onPress={()=>importTable()}>
                                <Text style={{fontSize:20,color:"#239623"}}>Import</Text>
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
 
