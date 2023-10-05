import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons'
import styles from '../styles';
import NavBar from '../Components/Navbar';
import { useState } from 'react';

export default function TimetableScreen({navigation}) {

    const s = 150;

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

    const [tables,setTables] = useState([JSON.parse(JSON.stringify(tableTemplate))]);
    const [tableIndex,setTableIndex] = useState(0);

    const colors = ["rgb(255,255,200)","rgb(200,255,255)","rgb(200,255,200)","rgb(255,220,220)"]

    const [periodToAdd,setPeriodToAdd] = useState({
        title: "",
        from: "",
        to: "",
        location: "",
        instructor: ""
    });
    const [periodToView,setPeriodToView] = useState()

    const [dayToAdd,setDayToAdd] = useState();

    const [addModel,setAddModal] = useState(false);
    const [settingsModal,setSettingsModal] = useState(false);
    const [tableTitleEdit,setTableTitleEdit] = useState(false);

    function handleAddPeriod(text,property)
    {
        setPeriodToAdd({...periodToAdd,[property]: text})
    }

    function addPeriod()
    {
        if(periodToAdd.title)
        {
            setTables(tables.map((table,index)=>index===tableIndex ? {...table,content: {...table.content,[dayToAdd]:[...table.content[dayToAdd],periodToAdd]}    } : table));
            setPeriodToAdd({
                title: "",
                from: "",
                to: "",
                location: "",
                instructor: ""
            });
            setDayToAdd();
            setAddModal(false);
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
        if(tables.length>1) setTables(tables.filter((table,index)=>index!==tableIndex))
    }

    return (
        <View style={styles.pageContainer}>
            <NavBar navigation={navigation} />

            <View style={{flexDirection:"row",width:"100%"}}>

                <Pressable style={{alignItems:"center",justifyContent:"center",width:50}} onPress={()=>setSettingsModal(true)}>
                    <MaterialCommunityIcons name='cog' size={35} color="gray" />
                </Pressable>

                <ScrollView style={{width:"100%",padding:20}} contentContainerStyle={{flexDirection:"row",alignItems:"center",gap:20}} horizontal>
                {
                    tables.map((table,index)=>
                    <Pressable style={tableIndex===index ? styles.tableTabActive : styles.tableTab} onPress={()=>setTableIndex(index)}>
                        <Text style={{fontSize:20,color:tableIndex===index ? "black" : "gray"}}>{table.name}</Text>
                    </Pressable>
                    )
                }
                    <Pressable onPress={()=>setTables([...tables,JSON.parse(JSON.stringify(tableTemplate))])}>
                        <MaterialCommunityIcons name='plus-circle' size={25} color="gray" />
                    </Pressable>

                </ScrollView>
            </View>

            <ScrollView>
                <ScrollView horizontal={true}>
                    <View style={{flexDirection:"row"}}>
                    {

                        Object.keys(tables[tableIndex].content).map((day,i)=>
                        <View style={{width:s}}>
                            <View style={{width:"100%",alignItems:"center",borderColor:"black",borderBottomWidth:1.5,paddingBottom:8}}>
                                <Text style={{fontSize:20,textTransform:"uppercase"}}>{day}</Text>
                            </View>
                            <View style={{minHeight:500,width:"100%"}}>

                                <View>
                                {
                                    tables[tableIndex].content[day].map((period,j) =>
                                    <Pressable
                                    style={{width:"100%",alignItems:"center",justifyContent:"center",height:s,backgroundColor:colors[i*2%colors.length + j%colors.length],borderColor:"black",borderWidth:1}}
                                    onPress={()=>setPeriodToView({...period,day:day,index:j})} >
                                        <Text style={{textAlign:"center",fontSize:20}}>{period.title}</Text>

                                        <Text style={{position:"absolute",top:0,left:0,padding:5}}>{period.from} - {period.to}</Text>
                                        <Text style={{position:"absolute",bottom:0,left:0,padding:5}}>{period.location}</Text>
                                    </Pressable>
                                    )
                                }
                                </View>
                                <View style={{width:"100%"}}>
                                    <Pressable style={{width:"100%",alignItems:"center",justifyContent:"center",backgroundColor:"rgb(120,120,120)",height:s,borderColor:"black",borderWidth:1}} onPress={()=>{setDayToAdd(day);setAddModal(true);}}>
                                        <MaterialCommunityIcons name='plus-circle' size={40} color="white" />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                        )
                    }
                    </View>
                </ScrollView>
            </ScrollView>

            <Modal visible={addModel} animationType='slide'>
                <View style={{width:"100%",flexDirection:"row",justifyContent:"center",alignItems:"center",paddingTop:20}}>
                    <Text style={{fontSize:25}}>Add Period</Text>
                    <Pressable style={{position:"absolute",right:20,top:25}} onPress={()=>setAddModal(false)}>
                        <Text>Cancel</Text>
                    </Pressable>
                </View>
                <View style={{padding:50,gap:20,alignItems:"center"}}>
                    <View style={{gap:10,width:"100%"}}>
                        <Text style={{fontSize:20}}>Title:</Text>
                        <TextInput style={styles.textInput} value={periodToAdd.title} onChangeText={(text)=>handleAddPeriod(text,"title")} />
                    </View>

                    <View style={{width:"100%",flexDirection:"row",justifyContent:"space-between"}}>
                        <View style={{gap:10,width:"45%"}}>
                            <Text style={{fontSize:20}}>From:</Text>
                            <TextInput 
                            style={styles.textInput}
                            placeholder='00:00'
                            value={periodToAdd.from}
                            onChangeText={(text)=>handleAddPeriod(text,"from")} />
                        </View>

                        <View style={{gap:10,width:"45%"}}>
                            <Text style={{fontSize:20}}>To:</Text>
                            <TextInput 
                            style={styles.textInput}
                            placeholder='00:00'
                            value={periodToAdd.to}
                            onChangeText={(text)=>handleAddPeriod(text,"to")} />
                        </View>
                    </View>

                    <View style={{gap:10,width:"100%"}}>
                        <Text style={{fontSize:20}}>Location (optional):</Text>
                        <TextInput style={styles.textInput} value={periodToAdd.location} onChangeText={(text)=>handleAddPeriod(text,"location")} />
                    </View>

                    <View style={{gap:10,width:"100%"}}>
                        <Text style={{fontSize:20}}>Instructor (optional):</Text>
                        <TextInput style={styles.textInput} value={periodToAdd.instructor} onChangeText={(text)=>handleAddPeriod(text,"instructor")} />
                    </View>

                    <Pressable style={{padding:5,paddingHorizontal:15,borderColor:"black",borderWidth:2,borderRadius:5}} onPress={()=>addPeriod()}>
                        <Text style={{fontSize:25}}>Add</Text>
                    </Pressable>
                </View>
            </Modal>

            <Modal visible={periodToView!==undefined} animationType='slide' transparent>
                <View style={{width:"100%",flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.5)"}}>
                    <View style={{width:"90%",backgroundColor:"white",padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

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

                            <Pressable>
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
                    <View style={{width:"90%",backgroundColor:"white",padding:20,paddingTop:40,borderRadius:10,alignItems:"center"}}>

                        <View style={{marginBottom:50}}>
                        {
                            tableTitleEdit!==false ?
                            <View style={{flexDirection:"row",alignItems:"center",gap:5}}>
                                <TextInput
                                style={styles.textInput}
                                value={tableTitleEdit}
                                onChangeText={(text)=>setTableTitleEdit(text)}
                                />
                                <Pressable
                                style={{borderColor:"black",borderWidth:1,borderRadius:5,padding:5}}
                                onPress={()=>{setTables(tables.map((table,index)=>index===tableIndex ? {...table,name:tableTitleEdit} : table));setTableTitleEdit(false)}}>
                                    <Text style={{fontSize:20}}>Edit</Text>
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

                        <View style={{flexDirection:"row",gap:100}} onPress={()=>deleteTable()}>
                            <Pressable>
                                <Text style={{fontSize:25,color:"rgb(200,0,0)"}}>Delete</Text>
                            </Pressable>
                            <Pressable onPress={()=>resetTable()}>
                                <Text style={{fontSize:25,color:"rgb(0,140,180)"}}>Reset</Text>
                            </Pressable>
                        </View>

                        <Pressable style={{position:"absolute",top:0,right:0,padding:20}} onPress={()=>{setSettingsModal(false); setTableTitleEdit(false);}}>
                            <Text style={{fontSize:15}}>Close</Text>
                        </Pressable>

                    </View>
                </View>
            </Modal>

            <StatusBar style="auto"/>
        </View>
    );
}
 
