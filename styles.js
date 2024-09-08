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

		"page-container": {
			alignItems: "center",
			writingDirection:"ltr",
			width: "100%",
			flex: 1,
			backgroundColor: "white"
			// backgroundColor: theme["bg"],
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

		"text-input": {
			backgroundColor:"white",
			fontSize:20,
			padding:5,
			borderColor:"lightgray",
			borderWidth:1,
			borderRadius:5,
			pointerEvents:"auto",
			
		},

		"table-tab": {
			paddingBottom:10
		},
		"table-tab-active": {
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

		"border-primary": {
			borderColor: theme["primary"]
		},
		"border-danger": {
			borderColor: theme["danger"]
		},
		"border-success": {
			borderColor: theme["success"],
		},
		"border-current": {
			borderColor: theme["current"],
		},
		"border-faint": {
			borderColor: theme["faint"],
		},



		"color-primary": {
			color: theme["primary"]
		},
		"color-danger": {
			color: theme["danger"]
		},
		"color-success": {
			color: theme["success"]
		},
		"color-current": {
			color: theme["current"]
		},
		"color-dark": {
			color: theme["dark"]
		},
		"color-faint": {
			color: theme["faint"]
		},
		"color-faint-2": {
			color: theme["faint-2"]
		},
		"color-period-home": {
			color: theme["period-home"]
		},
		"color-selected": {
			color: theme["selected"]
		},


		"bg-white": {
			backgroundColor: "white"
		},
		"bg-main": {
			backgroundColor: theme["bg"]
		},

		"bg-dark": {
			backgroundColor: theme["dark"]
		},

		"bg-selected": {
			backgroundColor: theme["selected"]
		},

		"bg-faint": {
			backgroundColor: theme["faint"]
		},

		"bg-faint-light": {
			backgroundColor: theme["faint-2"]
		},

		"bg-period-home": {
			backgroundColor: theme["period-home"]
		},

		"bg-period-none": {
			backgroundColor: theme["period-none"]
		},

		"bg-period-1" : {
			backgroundColor: "rgb(255,255,200)"
		},

		"bg-period-2" : {
			backgroundColor: "rgb(200,255,255)"
		},

		"bg-period-3" : {
			backgroundColor: "rgb(200,255,200)"
		},

		"bg-period-4" : {
			backgroundColor: "rgb(200,255,200)"
		},


		"bg-primary": {
			backgroundColor: theme["primary"]
		},
		"bg-danger": {
			backgroundColor: theme["danger"]
		},
		"bg-success": {
			backgroundColor: theme["success"],
		},
		"bg-current": {
			backgroundColor: theme["current"],
		},

		"flex-row": {
			flexDirection: "row"
		},

		"home-period-container": {
			backgroundColor:theme["period-home"],
			minHeight: 150,
			padding:20,
			alignItems:"center",
			justifyContent:"center",
			width:"100%",
			borderRadius:10,
			shadowColor:"black",
			elevation:5,
			borderColor:theme["faint-2"]
		}
  });

}

export default getStyles;