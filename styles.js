import { StyleSheet } from 'react-native';
import themes from './themes';


const values = {
	"row": "row-reverse",
	"row-reverse": "row",
	"left": "right",
	"right": "left"
}

function getValue(value,lang)
{
	return lang==="ar" ? values[value] : value;
}

function getStyles(themeName,lang)
{
	const theme = themes[themeName]
	return  StyleSheet.create({

		container: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
		},

		pageContainer: {
			alignItems: "center",
			writingDirection:"ltr",
			width: "100%",
			flex: 1,
			backgroundColor: theme["bg"],
		},

		navbar: {
			height:85,
			width:"100%",
			backgroundColor: theme["dark"],
			paddingTop:35,
			paddingHorizontal:25,
			flexDirection:"row",
			justifyContent:"space-between",
			gap:25
		},

		text: {
			color: theme["text"]
		},

		textInput: {
			backgroundColor:"white",
			fontSize:20,
			padding:5,
			borderColor:"lightgray",
			borderWidth:1,
			borderRadius:5,
			pointerEvents:"auto",
			textAlign: getValue("left",lang),
			
		},

		tableTab: {
			paddingBottom:10
		},
		tableTabActive: {
			paddingBottom:10,
			borderBottomWidth:2
		},

		button: {
			padding:5,
			borderRadius:5,
			// borderWidth:2,
			justifyContent:"center",
			alignItems:"center",
			flexDirection:"row",
			gap:5
		},

		borderPrimary: {
			borderColor: theme["primary"]
		},
		borderDanger: {
			borderColor: theme["danger"]
		},
		borderSuccess: {
			borderColor: theme["success"],
		},
		borderCurrent: {
			borderColor: theme["current"],
		},

		colorPrimary: {
			color: theme["primary"]
		},
		colorDanger: {
			color: theme["danger"]
		},
		colorSuccess: {
			color: theme["success"]
		},
		colorCurrent: {
			color: theme["current"]
		},

		bgPrimary: {
			backgroundColor: theme["primary"]
		},
		bgDanger: {
			backgroundColor: theme["danger"]
		},
		bgSuccess: {
			backgroundColor: theme["success"],
		},
		bgCurrent: {
			backgroundColor: theme["current"],
		},

		flexRow: {
			flexDirection: getValue("row",lang)
		},
		textLeft: {
			textAlign: getValue("left",lang)
		},

		positionLeft: {
			[getValue("left",lang)]: 0
		},

		positionRight: {
			[getValue("right",lang)]: 0
		}
  });

}

export default getStyles;