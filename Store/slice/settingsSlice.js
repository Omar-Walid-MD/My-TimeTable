import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-community/async-storage'
import getStyles from '../../styles';
import i18n from '../../i18n';

const initialState = {
    theme: "green",
    styles: getStyles("green"),
    minutes: 5,
    lang: "en",
    loading: true,
}


export const getTheme = createAsyncThunk(
  'settings/getTheme',
  async () => {
    const res = await AsyncStorage.getItem("theme");
    return res;
});

export const setTheme = createAsyncThunk(
'settings/setTheme',
  async (theme) => {
  await AsyncStorage.setItem("theme",theme);
  return theme;
});

export const getMinutes = createAsyncThunk(
  'settings/getMinutes',
  async () => {
    const res = await JSON.parse(AsyncStorage.getItem("minutes"));
    return res;
});

export const setMinutes = createAsyncThunk(
'settings/setMinutes',
  async (minutes) => {
  await AsyncStorage.setItem("minutes",JSON.stringify(minutes));
  return minutes;
});

export const getLang = createAsyncThunk(
  'settings/getLang',
  async () => {
    const res = await AsyncStorage.getItem("lang");
    return res;
});

export const setLang = createAsyncThunk(
'settings/setLang',
  async (lang) => {
  await AsyncStorage.setItem("lang",lang);
  return lang;
}); 

export const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder

      //getTheme
      .addCase(getTheme.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getTheme.fulfilled, (state, action) => {
        state.theme = action.payload || "green";
        state.styles = getStyles(action.payload || "green",state.lang);
        state.loading = false;
      })
      .addCase(getTheme.rejected, (state, action) => {
        state.loading = false;
      })

      //setTheme
      .addCase(setTheme.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(setTheme.fulfilled, (state, action) => {
        state.theme = action.payload;
        state.styles = getStyles(action.payload,state.lang);
        state.loading = false;
      })
      .addCase(setTheme.rejected, (state, action) => {
        state.loading = false;
      })

      //getMinutes
      .addCase(getMinutes.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getMinutes.fulfilled, (state, action) => {
        state.minutes = action.payload || 5;
        state.loading = false;
      })
      .addCase(getMinutes.rejected, (state, action) => {
        state.loading = false;
      })

      //setMinutes
      .addCase(setMinutes.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(setMinutes.fulfilled, (state, action) => {
        state.minutes = action.payload;
        state.loading = false;
      })
      .addCase(setMinutes.rejected, (state, action) => {
        state.loading = false;
      })

      //getLang
      .addCase(getLang.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getLang.fulfilled, (state, action) => {
        i18n.locale = action.payload;
        state.lang = action.payload || "en";
        state.styles = getStyles(state.theme,state.lang);
        state.loading = false;
      })
      .addCase(getLang.rejected, (state, action) => {
        state.loading = false;
      })

      //setLang
      .addCase(setLang.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(setLang.fulfilled, (state, action) => {
        i18n.locale = action.payload;
        state.lang = action.payload;
        state.styles = getStyles(state.theme,state.lang);
        state.loading = false;
      })
      .addCase(setLang.rejected, (state, action) => {
        state.loading = false;
      })

      
    },
});

export default settingsSlice.reducer;