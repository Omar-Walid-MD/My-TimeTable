import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, View, Animated, Easing, Text } from 'react-native';

function LoadingOverlay({visible}) {

    const rotation = useState(new Animated.Value(0))[0];
    useFocusEffect(
        useCallback(()=>{
            Animated.loop(
                Animated.timing(rotation,{toValue:360,duration:1000,useNativeDriver:true,easing:Easing.linear})
            ).start();
        },[])
    )


    return (
        <>
        {
            visible ?
            <View style={{height:"100%",width:"100%",backgroundColor:"rgba(0,0,0,0.7)",position:"absolute",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:10,zIndex:5}}>
                <Animated.View style={{transform:[{rotate:rotation.interpolate({inputRange:[0,360],outputRange:["0deg","360deg"]})}]}}>
                    <Image style={{height:50,width:50}} resizeMode='contain' source={require("../assets/spinner.png")} />
                </Animated.View>
            </View>
            :
            null
        }
        </>
    );
}

export default LoadingOverlay;