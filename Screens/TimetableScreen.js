import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons, Octicons } from 'react-native-vector-icons'
import styles from '../styles';
import NavBar from '../Components/Navbar';
import { useEffect, useState } from 'react';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { useDispatch, useSelector } from 'react-redux';
import store from '../Store/store';
import { setCurrentTable, updateTables } from '../Store/slice/slice';

export default function TimetableScreen({navigation}) {

    const s = 150;
    const dispatch = useDispatch();


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

    const [tables,setTables] = useState(useSelector(store => store.tables.tables) || [JSON.parse(JSON.stringify(tableTemplate))]);
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
    const [tableTitleEdit,setTableTitleEdit] = useState(false);

    const [fromTimePicker,setFromTimePicker] = useState(false);
    const [toTimePicker,setToTimePicker] = useState(false);

    const [existingOptions,setExistingOptions] = useState({
        titles:[],
        instructors: [],
        locations: []
    });

    const [suggestionBoxes,setSuggestionBoxes] = useState({titles:false});

    function getSuggestions(inputText,suggestionsList)
    {
        return suggestionsList.filter((suggestion) => inputText==="" || (suggestion.toLowerCase().includes(inputText.toLowerCase()) && suggestion !== inputText));
    }

    function handlePeriodForm(text,property)
    {
        setPeriodInForm({...periodInForm,[property]: text})
    }

    function addPeriod()
    {
        if(periodInForm.title)
        {
            setPeriodInForm({...periodInForm,index:tables[tableIndex].content[dayToAdd].length});
            setTables(tables.map((table,index)=>index===tableIndex ? {...table,content: {...table.content,[dayToAdd]:[...table.content[dayToAdd],periodInForm]}    } : table));
            setPeriodInForm({
                index: 0,
                title: "",
                from: "",
                to: "",
                location: "",
                instructor: ""
            });
            setDayToAdd();
            setPeriodModal(false);
        }
    }

    function editPeriod()
    {
        if(periodInForm.title)
        {
            setTables(tables.map((table,index)=>index===tableIndex ? {...table,content: {...table.content,[dayToAdd]:table.content[dayToAdd].map((p,i) => i===periodInForm.index ? periodInForm : p)}    } : table));
            setPeriodInForm({
                index: 0,
                title: "",
                from: "",
                to: "",
                location: "",
                instructor: ""
            });
            setDayToAdd();
            setPeriodModal(false);
        }
    }

    function deletePeriod(period)
    {
        setTables(tables.map((table,index)=>index===tableIndex ?   {...table,content: {...table.content,[period.day]:table.content[period.day].filter((p,i)=>i!==period.index)} } : table));
        setPeriodToView(undefined);
    }

    function resetTable()
    {
        setTables(tables.map((table,index)=>index===tableIndex ? JSON.parse(JSON.stringify(tableTemplate)) : table))
    }

    function deleteTable()
    {
        if(tables.length>1)
        {
            setSettingsModal(false);
            setTables(tables.filter((table,index)=>index!==tableIndex));

            let newIndex = tableIndex>0 ? tableIndex-1 : tableIndex+1;
            if(tableIndex===currentTable) dispatch(setCurrentTable(newIndex));
            setTableIndex(newIndex);
        }
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

                })
            })
        })
        setExistingOptions(tempExistingOptions);
        
        if(tables.length)
        {
            dispatch(updateTables(tables));
            // console.log("updated");
        }
    },[tables])

    return (
        <View style={styles.pageContainer}>
            <NavBar navigation={navigation} />

            <View style={{flexDirection:"row",width:"100%"}}>

                <ScrollView style={{width:"100%",padding:20}} contentContainerStyle={{flexDirection:"row",alignItems:"center",gap:20}} horizontal>
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
                    <Pressable style={{backgroundColor:"#87A087",borderRadius:5,paddingHorizontal:5,paddingVertical:2,marginBottom:12}} onPress={()=>setTables([...tables,JSON.parse(JSON.stringify(tableTemplate))])}>
                        <Octicons name='plus' size={20} color="white" />
                    </Pressable>

                </ScrollView>
            </View>

            <View style={{flex:1}}>
                <ScrollView contentContainerStyle={{flexGrow:1}}>
                    <ScrollView horizontal contentContainerStyle={{flexGrow:1}}>
                        <View style={{flexDirection:"row"}}>
                        {

                            Object.keys(tables[tableIndex].content).map((day,i)=>
                            <View style={{width:s}} key={`table-item-${i}`}>
                                <View style={{width:"100%",alignItems:"center",paddingBottom:10}}>
                                    <Text style={{fontSize:20,textTransform:"uppercase"}}>{day}</Text>
                                </View>
                                <View style={{width:"100%"}}>

                                    {
                                        tables[tableIndex].content[day].map((period,j) =>
                                        <Pressable
                                        style={{width:"100%",alignItems:"center",justifyContent:"center",height:s,padding:2}}
                                        onPress={()=>{setPeriodToView({...period,day:day,index:j});setDayToAdd(day);}}
                                        key={`table-period-${day}-${j}`}>
                                            <View style={{width:"100%",height:"100%",alignItems:"center",justifyContent:"center",backgroundColor:colors[i*2%colors.length + j%colors.length],borderRadius:5,shadowColor:"black",elevation:5}}>
                                                <Text style={{textAlign:"center",fontSize:20}}>{period.title}</Text>
                                                <Text style={{position:"absolute",top:0,left:0,padding:5}}>{period.from} - {period.to}</Text>
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
                    <Pressable style={{position:"absolute",right:20,top:25,pointerEvents:"auto"}} onPress={()=>{setSuggestionBoxes({titles:false,locations:false,instructors:false});setPeriodModal(false)}}>
                        <Text>Cancel</Text>
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
                            value={periodInForm.from}
                            onChangeText={(text)=>handlePeriodForm(text,"from")}
                            onPressIn={()=>setFromTimePicker(true)}
                            />
                        </View>

                        <View style={{gap:10,width:"45%"}}>
                            <Text style={{fontSize:20}}>To:</Text>
                            <TextInput 
                            style={styles.textInput}
                            placeholder='00:00'
                            value={periodInForm.to}
                            onChangeText={(text)=>handlePeriodForm(text,"to")}
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
            </Modal>

            <Modal visible={periodToView!==undefined} animationType='slide' transparent>
                <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                    <View style={{width:"90%",backgroundColor:"#F5FAF5",padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                        {
                            periodToView &&

                            <View style={{alignItems:"center",gap:10,marginBottom:50}}>
                                <Text style={{fontSize:40}}>{periodToView.title}</Text>
                                <Text style={{fontSize:25}}>{periodToView.from} - {periodToView.to}</Text>
                                {periodToView.location && <Text style={{fontSize:25}}>At: {periodToView.location}</Text>}
                                {periodToView.instructor && <Text style={{fontSize:25}}>By: {periodToView.instructor}</Text>}
                            </View>
                        }

                        <View style={{flexDirection:"row",gap:100}}>
                            <Pressable onPress={()=>deletePeriod(periodToView)}>
                                <Text style={{fontSize:25,color:"rgb(200,0,0)"}}>Delete</Text>
                            </Pressable>

                            <Pressable onPress={()=>{setPeriodModalForm("edit");setPeriodInForm(periodToView);setPeriodModal(true);setPeriodToView(undefined);}}>
                                <Text style={{fontSize:25,color:"rgb(0,140,180)"}}>Edit</Text>
                            </Pressable>
                        </View>

                        <Pressable style={{position:"absolute",top:0,right:0,padding:20}} onPress={()=>setPeriodToView(undefined)}>
                            <Text style={{fontSize:15}}>Close</Text>
                        </Pressable>

                    </View>
                </View>
            </Modal>

            <Modal visible={settingsModal} animationType='slide' transparent>
                <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                    <View style={{width:"90%",backgroundColor:"#F5FAF5",padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                        <View style={{marginBottom:50}}>
                        {
                            tableTitleEdit!==false ?
                            <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
                                <TextInput
                                style={styles.textInput}
                                value={tableTitleEdit}
                                onChangeText={(text)=>setTableTitleEdit(text)}
                                />
                                <Pressable
                                style={{backgroundColor:"black",borderRadius:5,padding:5}}
                                onPress={()=>{setTables(tables.map((table,index)=>index===tableIndex ? {...table,name:tableTitleEdit} : table));setTableTitleEdit(false)}}>
                                    <Text style={{color:"white",fontSize:20}}>Edit</Text>
                                </Pressable>
                            </View>
                            :
                            <>
                                <Text style={{fontSize:30,borderColor:"black",borderBottomWidth:2,paddingHorizontal:20}}>{tables[tableIndex].name}</Text>
                                <Pressable style={{position:"absolute",bottom:-12,right:-10,backgroundColor:"black",borderRadius:20,padding:5}} onPress={()=>setTableTitleEdit(tables[tableIndex].name)}>
                                    <MaterialCommunityIcons name='pencil' size={15} color="white" />
                                </Pressable>
                            </>
                        }
                        </View>

                        <View style={{flexDirection:"row",gap:20,alignItems:"center"}}>
                            {
                                tables.length > 1 &&
                                <Pressable onPress={()=>deleteTable()}>
                                    <Text style={{fontSize:20,color:"rgb(200,0,0)"}}>Delete</Text>
                                </Pressable>
                            }
                            {
                                tableIndex !== currentTable &&
                                <Pressable onPress={()=>dispatch(setCurrentTable(tableIndex))}>
                                    <Text style={{fontSize:20,color:"white",backgroundColor:"#239623",padding:5,borderRadius:5}}>Set Current</Text>
                                </Pressable>
                            }
                            <Pressable onPress={()=>resetTable()}>
                                <Text style={{fontSize:20,color:"rgb(0,140,180)"}}>Reset</Text>
                            </Pressable>
                        </View>

                        <Pressable style={{position:"absolute",top:0,right:0,padding:20}} onPress={()=>{setSettingsModal(false); setTableTitleEdit(false);}}>
                            <Text style={{fontSize:15}}>Close</Text>
                        </Pressable>

                    </View>
                </View>
            </Modal>

            <DateTimePicker
                isVisible={fromTimePicker}
                mode="time"
                onConfirm={(time)=>{setFromTimePicker(false);setPeriodInForm({...periodInForm,from:time.toTimeString().slice(0,5)})}}
                onCancel={()=>setFromTimePicker(false)}
            />

            <DateTimePicker
                isVisible={toTimePicker}
                mode="time"
                onConfirm={(time)=>{setToTimePicker(false);setPeriodInForm({...periodInForm,to:time.toTimeString().slice(0,5)})}}
                onCancel={()=>setToTimePicker(false)}
            />

            <StatusBar style="auto"/>
        </View>
    );
}
 
