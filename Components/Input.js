import { View, TextInput, Animated } from 'react-native';
import styles from "../styles";
import Text from './Text';
import { useEffect, useState } from 'react';
import i18n from '../i18n';
import { useSelector } from 'react-redux';

export default function Input(props) {

    const styles = useSelector(store => store.settings.styles);

    return (
        <View style={{width:"100%"}}>
            <TextInput textAlign={i18n.language.includes("ar") ? 'right': 'left'}
            style={{...styles['text-input'],fontFamily:"Cairo",...(props.styles || {})}}
            {...props}/>
            
        </View>
    );
}