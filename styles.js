import { StyleSheet } from 'react-native';
import themes from './themes';


function getStyles(themeName)
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
			backgroundColor: theme["bg"]
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
			pointerEvents:"auto"
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
			borderWidth:2,
			justifyContent:"center",
			alignItems:"center"
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

		colorPrimary: {
			color: theme["primary"]
		},
		colorDanger: {
			color: theme["danger"]
		},
		colorSuccess: {
			color: theme["success"]
		},

		bgPrimary: {
			backgroundColor: theme["primary"]
		},
		bgDanger: {
			backgroundColor: theme["danger"]
		},
		bgSuccess: {
			backgroundColor: theme["success"],
		}
  });

}

export default getStyles;