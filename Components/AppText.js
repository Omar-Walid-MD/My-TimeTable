import React, { useCallback, useEffect, useState } from 'react';
import { Image, View, Animated, Easing, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removePopup } from '../Store/slice/popupsSlice';
import themes from '../themes';
import { useFonts } from 'expo-font';

function AppText(props) {

//    const [loaded] = useFonts()

    return (
        <Text style={{...props.style,width:"auto",fontFamily: `${props.fontFamily}${props.fontWeight ? "-"+props.fontWeight : ""}` || "",fontWeight: (props.fontWeight && !props.fontFamily) ? props.fontWeight : "normal"}}>
        {
            props.children
        }
        </Text>
    );
}

export default AppText;