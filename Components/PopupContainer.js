import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, View, Animated, Easing, Text } from 'react-native';
import Popup from './Popup';
import { useSelector } from 'react-redux';

function PopupContainer({}) {

    const popups = useSelector(store => store.popups.popups);

    return (
        <View style={{position:"absolute",alignItems:"center",bottom:0,height:100}}>
        {
            popups.map((popup,index) =>
            <Popup key={popup.id} popup={popup} />
            )
        }
        </View>
    );
}

export default PopupContainer;