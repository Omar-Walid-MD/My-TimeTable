import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-community/async-storage'

const initialState = {
    tables: null,
    currentTable: 0,
    loading: true,
}

export const getTables = createAsyncThunk(
    'tables/getTables',
    async () => {
      const res = await AsyncStorage.getItem("tables");
      return JSON.parse(res);
});

export const getCurrentTable = createAsyncThunk(
  'tables/getCurrentTable',
  async () => {
    const res = await AsyncStorage.getItem("currentTable");
    return res;
});

export const updateTables = createAsyncThunk(
  'tables/updateTables',
  async (tables) => {
    await AsyncStorage.setItem("tables",JSON.stringify(tables));
    return tables;
});

export const setCurrentTable = createAsyncThunk(
  'tables/setCurrentTable',
  async (currentTable) => {
    AsyncStorage.setItem("currentTable",`${currentTable}`);
    return currentTable;
});

export const playerDataSlice = createSlice({
    name: "tables",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder

      //getTables
      .addCase(getTables.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getTables.fulfilled, (state, action) => {
        state.tables = action.payload;
        state.loading = false;
      })
      .addCase(getTables.rejected, (state, action) => {
        state.loading = false;
      })

      //getCurrentTable
      .addCase(getCurrentTable.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getCurrentTable.fulfilled, (state, action) => {
        if(action.payload)
        {
          state.currentTable = parseInt(action.payload);
        }
        state.loading = false;
      })
      .addCase(getCurrentTable.rejected, (state, action) => {
        state.loading = false;
      })

      //updateTables
      .addCase(updateTables.fulfilled, (state, action) => {
        state.tables = action.payload
      })

      //setCurrentTable
      .addCase(setCurrentTable.fulfilled, (state, action) => {
        state.currentTable = action.payload
      })
    },
});

export default playerDataSlice.reducer;