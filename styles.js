import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pageContainer: {
    alignItems: "center",
    width: "100%",
  },

  navbar: {
    height:85,
    width:"100%",
    backgroundColor:"lightgray",
    paddingTop:35,
    paddingHorizontal:25,
    flexDirection:"row",
    gap:25
  },

  textInput: {
    fontSize:20,
    padding:5,
    borderColor:"lightgray",
    borderWidth:1,
    borderRadius:5
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