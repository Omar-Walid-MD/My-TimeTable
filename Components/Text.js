import { Text as RN_Text } from 'react-native';
import styles from "../styles";
import PropTypes from 'prop-types';
import i18n from '../i18n';
import { useSelector } from 'react-redux';

/**
 * MyComponent description
 * @param {object} props - Component props
 * @param {"sb"|"b"} props.weight - The variant of the component
 * @param {"main"} props.font - The variant of the component
 */

export default function Text(props) {

    const threshold = 1569;

    let text = props.children;
    if(typeof text === "number") text = `${text}`;
    else if(typeof text === "object") text = `${text[0]}`;

    const fontFamily = props.font==="main" || !props.font ? (text.charCodeAt(0)>=threshold ? "Cairo" : "Ubuntu") : "";

    const font = `${fontFamily}${props.weight ? "_" : ""}${props.weight || ""}`;
    return (
        <RN_Text
        style={{
            fontFamily:font,
            ...(props.style || {})
        }}
        >
        {props.children}
        </RN_Text>
    )
}

Text.propTypes = {
    children: PropTypes.node,
    style: PropTypes.object,
    font: PropTypes.string,
    weight: PropTypes.string
};