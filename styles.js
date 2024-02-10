import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pageContainer: {
    alignItems: "center",
    direction:"ltr",
    width: "100%",
    flex: 1,
    backgroundColor: "#F5FAF5"
  },

  navbar: {
    height:85,
    width:"100%",
    backgroundColor:"#4B734B",
    paddingTop:35,
    paddingHorizontal:25,
    flexDirection:"row",
    gap:25
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
  }
});


export default styles;