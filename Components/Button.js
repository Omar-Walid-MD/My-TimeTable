import { Text, View, Image, Pressable, Animated } from 'react-native';
import styles from "../styles";
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';


export default function Button(props) {

    const styles = useSelector(store => store.settings.styles);
    const buttonOverlayOpacity = useState(new Animated.Value(0))[0];

    return (
            <Pressable
            style={{...styles["button"],...(props.style || {})}}
            onPress={props.onPress}

            onPressIn={()=>
                Animated.timing(buttonOverlayOpacity,{
                    toValue: 0.35,
                    duration: 100,
                    useNativeDriver: false
                }).start()
            }
            onPressOut={()=>
                Animated.timing(buttonOverlayOpacity,{
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: false
                }).start()
            }
            >
                {props.children}
                <Animated.View pointerEvents="none"
                style={{...styles["button-overlay"],opacity:buttonOverlayOpacity}}
                ></Animated.View>
            </Pressable>

    )
}

// Define the type for your props
Button.propTypes = {
    children: PropTypes.node,
    onPress: PropTypes.func,
    style: PropTypes.object,
};