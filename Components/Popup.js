import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, View, Animated, Easing, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removePopup } from '../Store/slice/popupsSlice';

import { FontAwesome5 } from 'react-native-vector-icons'
import themes from '../themes';
import AppText from './Text';

function Popup({popup}) {

    const dispatch = useDispatch();
    const currentTheme = useSelector(store => store.settings.theme);
    const styles = useSelector(store => store.settings.styles);

    const duration = 5000;

    const y = useState(new Animated.Value(100))[0];
    const [timer,setTimer] = useState(null);
 
    useFocusEffect(
        useCallback(()=>{
            Animated.timing(y,{toValue:0,duration:500,useNativeDriver:false,delay:10}).start();
            setTimeout(()=>{
                Animated.timing(y,{toValue:100,duration:500,useNativeDriver:false}).start();
            },duration-500);
            setTimer(
                setTimeout(()=>{
                    dispatch(removePopup(popup.id))
                },duration)
            );

            
        },[])
    );

    useEffect(()=>{
        return ()=>{
            // console.log("Cleared")
            clearTimeout(timer);
            setTimer(null); 
        }
    },[]);

    return (
        <Animated.View style={{...styles.flexRow,alignItems:"center",gap:5,position:"absolute",transform:[{translateY:y}],backgroundColor:themes[currentTheme]["current"],padding:5,borderRadius:5,shadowColor:"black",elevation:5}}>
            <AppText fontFamily={""} style={{fontSize:15,color:"white"}}>{popup.text}</AppText>
            <FontAwesome5 name="check-circle" color="white" size={20} />
        </Animated.View>
    );
}

export default Popup;