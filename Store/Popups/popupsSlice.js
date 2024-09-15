import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-community/async-storage'
import getStyles from '../../styles';

const initialState = {
    popups: [],
    loading: true,
}

export const makeId = function(length)
{
    let s = "1234567890";
    let id = "";

    for (let i = 0; i < length; i++) {
        let char = s[parseInt(Math.random()*(s.length-1))];
        id += char;
    }

    return id;
}



export const addPopup = createAsyncThunk(
  'popups/addPopup',
  async ({text,state}) => {
    return {text,id:makeId(8),state: state || "success"};
});

export const removePopup = createAsyncThunk(
  'popups/removePopup',
  async (popupId) => {
    return popupId;
});

export const clearPopups = createAsyncThunk(
  'popups/clearPopups',
  async () => {
    return;
});

export const popupsSlice = createSlice({
    name: "popups",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder

      //addPopup
      .addCase(addPopup.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(addPopup.fulfilled, (state, action) => {
        state.popups.push(action.payload);
        state.loading = false;
      })
      .addCase(addPopup.rejected, (state, action) => {
        state.loading = false;
      })

      //removePopup
      .addCase(removePopup.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(removePopup.fulfilled, (state, action) => {
        state.popups = state.popups.filter((p) => p.id !== action.payload);
        state.loading = false;
      })
      .addCase(removePopup.rejected, (state, action) => {
        state.loading = false;
      })

      //clearPopups
      .addCase(clearPopups.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(clearPopups.fulfilled, (state, action) => {
        state.popups = [];
        state.loading = false;
      })
      .addCase(clearPopups.rejected, (state, action) => {
        state.loading = false;
      })
    },
});

export default popupsSlice.reducer;