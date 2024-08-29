import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { MaterialCommunityIcons, MaterialIcons, Octicons, Feather } from 'react-native-vector-icons'
import { useDispatch, useSelector } from "react-redux";
import Text from "../Text";
import themes from '../../themes';
import i18n from "../../i18n";
import DateTimePicker from "react-native-modal-datetime-picker";
import { getTimeString, popup } from "../../helper";
import { addPeriod, editPeriod, updateTables } from "../../Store/Tables/tablesSlice";
import { setPeriodModalForm } from "../../Store/Modals/modalsSlice";
import { addPeriodNotification, editPeriodNotification } from "../../notifications";

export default function PeriodFormModal({tables,tableIndex}) {

    const dispatch = useDispatch();

    const currentTable = useSelector(store => store.tables.currentTable);
    const styles = useSelector(store => store.settings.styles);
    const currentTheme = useSelector(store => store.settings.theme);
    const currentMinutes = useSelector(store => store.settings.minutes);

    const periodModalForm = useSelector(store => store.modals.periodModalForm);
    const periodInForm = useSelector(store => store.modals.periodInForm);
    const [periodInFormEdit,setPeriodInFormEdit] = useState();


    const [fromTimePicker,setFromTimePicker] = useState(false);
    const [toTimePicker,setToTimePicker] = useState(false);

    const [existingOptions,setExistingOptions] = useState({
        titles:[],
        times: [],
        instructors: [],
        locations: []
    });

    const [suggestionKey,setSuggestionKey] = useState(null);

    function getSuggestions(periodInFormEdit,existingOptions,suggestionKey)
    {
        if(suggestionKey!=="time")
        {
            let inputText = periodInFormEdit[suggestionKey];
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
        setPeriodInFormEdit({...periodInFormEdit,[property]: text})
    }

    async function handleAddPeriod()
    {
        if(periodInFormEdit.title && periodInFormEdit.from && periodInFormEdit.to)
        {
            const newPeriod = {
                ...periodInFormEdit,
                title: periodInFormEdit.title.trim(),
                location: periodInFormEdit.location.trim(),
                instructor: periodInFormEdit.instructor.trim(),
            };

            if(currentTable === tableIndex) newPeriod.notifId = await addPeriodNotification(newPeriod,currentMinutes,i18n.t("notif"));

            dispatch(addPeriod({
                period: newPeriod,
                tableIndex
            }));

            resetPeriodForm();
            popup("add-period");

        }
    }

    async function handleEditPeriod()
    {
        if(periodInFormEdit.title && periodInFormEdit.from && periodInFormEdit.to)
        {
            const editedPeriod = {
                ...periodInFormEdit,
                title: periodInFormEdit.title.trim(),
                location: periodInFormEdit.location.trim(),
                instructor: periodInFormEdit.instructor.trim()
            };
            
            if(currentTable === tableIndex) editedPeriod.notifId = await editPeriodNotification(editedPeriod,currentMinutes,i18n.t("notif"));

            dispatch(editPeriod({
                period: editedPeriod,
                tableIndex
            }))
            resetPeriodForm();
            popup("edit-period");
        }
    }

    function resetPeriodForm()
    {
        dispatch(setPeriodModalForm(null));
        setPeriodInFormEdit({
            index: 0,
            title: "",
            from: "",
            to: "",
            location: "",
            instructor: "",
            day: 0
        });
    }

    useEffect(()=>{
        setPeriodInFormEdit(periodInForm);
    },[periodInForm])

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


        
    },[]);

    return (
        <>
            <Modal visible={periodModalForm!==null} animationType='slide'>
                <ScrollView contentContainerStyle={{flexGrow:1}}>
                    <View style={{backgroundColor:themes[currentTheme]["bg"],width:"100%",justifyContent:"center",alignItems:"center",paddingTop:20}}>
                        <Text fontFamily={""} style={{...styles.text,fontSize:25}}>{i18n.t(`tables.${periodModalForm}`)} {i18n.t("tables.period")}</Text>
                        <Pressable style={{position:"absolute",...styles.positionRight,top:0,padding:5,margin:20,borderRadius:5,backgroundColor:"black"}} onPress={()=>{resetPeriodForm();}}>
                            <Feather name="x" size={20} color="white" />
                        </Pressable>
                    </View>
                    {
                        periodInFormEdit &&
                        <View style={{backgroundColor:themes[currentTheme]["bg"],height:"100%",padding:50,gap:20,alignItems:"center"}}>
                            <View style={{gap:10,width:"100%"}}>
                                <Text fontFamily={""} style={{...styles.text,fontSize:20}}>{i18n.t("tables.title")}:</Text>
                                <TextInput style={{...styles.textInput,fontFamily:""}} value={periodInFormEdit.title} onChangeText={(text)=>handlePeriodForm(text,"title")}/>

                                {
                                    getSuggestions(periodInFormEdit,existingOptions,"title").length ?
                                    <Pressable style={{position:"absolute",...styles.positionRight,bottom:12,width:45,height:45,alignItems:"center",justifyContent:"center"}} onPress={()=>setSuggestionKey("title")}>
                                        <MaterialIcons name="search" size={25} color={themes[currentTheme]["primary"]} />
                                    </Pressable>
                                    :
                                    null
                                }
                                
                            </View>

                            <View style={{width:"100%",...styles.flexRow,justifyContent:"space-between"}}>
                                <View style={{gap:10,width:"45%"}}>
                                    <Text fontFamily={""} style={{...styles.text,fontSize:20}}>{i18n.t("tables.from")}:</Text>
                                    <TextInput 
                                    style={{...styles.textInput,fontFamily:""}}
                                    placeholder='00:00'
                                    value={getTimeString(periodInFormEdit.from)}
                                    onPressIn={()=>setFromTimePicker(true)}
                                    />
                                </View>

                                <View style={{gap:10,width:"45%"}}>
                                    <Text fontFamily={""} style={{...styles.text,fontSize:20}}>{i18n.t("tables.to")}:</Text>
                                    <TextInput 
                                    style={{...styles.textInput,fontFamily:""}}
                                    placeholder='00:00'
                                    value={getTimeString(periodInFormEdit.to)}
                                    onPressIn={()=>setToTimePicker(true)}
                                    />
                                    <Pressable style={{position:"absolute",...styles.positionRight,bottom:12,width:45,height:45,alignItems:"center",justifyContent:"center"}} onPress={()=>setSuggestionKey("time")}>
                                        <MaterialIcons name="search" size={25} color={themes[currentTheme]["primary"]} />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={{gap:10,width:"100%"}}>
                                <Text fontFamily={""} style={{...styles.text,fontSize:20}}>{i18n.t("tables.loc")} ({i18n.t("tables.opt")}):</Text>
                                <TextInput style={{...styles.textInput,fontFamily:""}} value={periodInFormEdit.location} onChangeText={(text)=>handlePeriodForm(text,"location")}/>
                                {
                                    getSuggestions(periodInFormEdit,existingOptions,"location").length ?
                                    <Pressable style={{position:"absolute",...styles.positionRight,bottom:12,width:45,height:45,alignItems:"center",justifyContent:"center"}} onPress={()=>setSuggestionKey("location")}>
                                        <MaterialIcons name="search" size={25} color={themes[currentTheme]["primary"]} />
                                    </Pressable>
                                    :
                                    null
                                }
                                
                            </View>

                            <View style={{gap:10,width:"100%"}}>
                                <Text fontFamily={""} style={{...styles.text,fontSize:20}}>{i18n.t("tables.inst")} ({i18n.t("tables.opt")}):</Text>
                                <TextInput style={{...styles.textInput,fontFamily:""}} value={periodInFormEdit.instructor} onChangeText={(text)=>handlePeriodForm(text,"instructor")}/>
                                {
                                    getSuggestions(periodInFormEdit,existingOptions,"instructor").length ?
                                    <Pressable style={{position:"absolute",...styles.positionRight,bottom:12,width:45,height:45,alignItems:"center",justifyContent:"center"}} onPress={()=>setSuggestionKey("instructor")}>
                                        <MaterialIcons name="search" size={25} color={themes[currentTheme]["primary"]} />
                                    </Pressable>
                                    :
                                    null
                                }
                            </View>

                            <Pressable style={{padding:5,paddingHorizontal:15,backgroundColor:"black",borderRadius:5,pointerEvents:"auto"}}
                            onPress={()=>{periodModalForm==="add" ? handleAddPeriod() : handleEditPeriod()}}>
                                <Text fontFamily={""} style={{...styles.text,color:"white",fontSize:25}}>{i18n.t(`tables.${periodModalForm}`)}</Text>
                            </Pressable>
                            
                        </View>
                    }
                </ScrollView>
            
            {
                suggestionKey &&
                <View style={{position:"absolute",height:"100%",width:"100%",padding:50,backgroundColor:"rgba(0,0,0,0.7)",justifyContent:"center",alignItems:"center"}}>
                    <View style={{width:"100%",backgroundColor:"white",padding:5,borderRadius:5,shadowColor:"black",elevation:5}}>
                        <View style={{padding:10}}>
                            <Text fontFamily={""} style={{fontSize:20}}>{i18n.t("tables.suggestions")}</Text>

                            <Pressable style={{position:"absolute",top:0,...styles.positionRight,padding:5,margin:10,borderRadius:5,backgroundColor:"black"}} onPress={()=>setSuggestionKey(null)}>
                                <Feather name="x" size={20} color="white" />
                            </Pressable>
                        </View>
                        <View style={{width:"100%",borderColor:"black",borderWidth:1,marginTop:5}}></View>
                        <ScrollView style={{height:300}}>
                        {
                            suggestionKey!=="time" ?
                            getSuggestions(periodInFormEdit,existingOptions,suggestionKey).map((suggestion,index)=>

                            <View style={{width:"100%"}} key={`sug-option-${index}`}>
                                <Pressable style={{width:"100%",padding:10,borderBottomWidth:1,borderColor:"black"}} onPress={()=>{setPeriodInFormEdit({...periodInFormEdit,[suggestionKey]:suggestion});setSuggestionKey(null);}}>
                                    <Text fontFamily={""} style={{fontSize:20,...styles.textLeft}}>{suggestion}</Text>
                                </Pressable>
                            </View>
                            )
                            :
                            getSuggestions(periodInFormEdit,existingOptions,"time").map((suggestion,index)=>

                            <View style={{width:"100%"}} key={`sug-option-${index}`}>
                                <Pressable style={{width:"100%",padding:10,borderBottomWidth:1,borderColor:"black"}} onPress={()=>{setPeriodInFormEdit({...periodInFormEdit,"from":suggestion.from,"to":suggestion.to});setSuggestionKey(null);}}>
                                    <Text fontFamily={""} style={{fontSize:20}}>{getTimeString(suggestion.from)} - {getTimeString(suggestion.to)}</Text>
                                </Pressable>
                            </View>
                            )
                        }
                        </ScrollView>
                    </View>
                </View>
            }

            </Modal>
        
            <DateTimePicker
                isVisible={fromTimePicker}
                mode="time"
                accentColor='red'
                onConfirm={(time)=>{setFromTimePicker(false);setPeriodInFormEdit({...periodInFormEdit,from:time.toTimeString().slice(0,5)})}}
                onCancel={()=>setFromTimePicker(false)}
            />

            <DateTimePicker
                isVisible={toTimePicker}
                mode="time"
                accentColor='red'
                onConfirm={(time)=>{setToTimePicker(false);setPeriodInFormEdit({...periodInFormEdit,to:time.toTimeString().slice(0,5)})}}
                onCancel={()=>setToTimePicker(false)}
            />
        </>
    );
}

