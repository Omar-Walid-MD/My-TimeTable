import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-community/async-storage'
import getStyles from '../../styles';

const initialState = {
    theme: "main",
    styles: getStyles("main"),
    loading: true,
}


export const getTheme = createAsyncThunk(
  'theme/getTheme',
  async () => {
    const res = await AsyncStorage.getItem("theme");
    return res;
});

export const setTheme = createAsyncThunk(
'theme/setTheme',
  async (theme) => {
  await AsyncStorage.setItem("theme",theme);
  return theme;
}); 

export const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder

      //getTheme
      .addCase(getTheme.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getTheme.fulfilled, (state, action) => {
        state.theme = action.payload || "main";
        state.styles = getStyles(action.payload || "main");
        state.loading = false;
      })
      .addCase(getTheme.rejected, (state, action) => {
        state.loading = false;
      })

      //getTheme
      .addCase(setTheme.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(setTheme.fulfilled, (state, action) => {
        state.theme = action.payload;
        state.styles = getStyles(action.payload);
        state.loading = false;
      })
      .addCase(setTheme.rejected, (state, action) => {
        state.loading = false;
      })

      
    },
});

export default themeSlice.reducer;