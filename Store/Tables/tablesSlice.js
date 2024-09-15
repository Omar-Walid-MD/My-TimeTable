import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-community/async-storage'
import i18n from '../../i18n';
import { tableTemplate } from '../../helpers';

const initialState = {
    tables: [
      tableTemplate
    ],
    currentTable: 0,
    loading: true,
}

export const getTables = createAsyncThunk(
    'tables/getTables',
    async () => {
      // await AsyncStorage.removeItem("tables")
      const res = JSON.parse(await AsyncStorage.getItem("tables"));
      return res;
});

export const getCurrentTable = createAsyncThunk(
  'tables/getCurrentTable',
  async () => {
    await AsyncStorage.setItem("currentTable","0");
    // console.log("here");
    const res = await AsyncStorage.getItem("currentTable") || 0;
    return res;
});


export const setCurrentTable = createAsyncThunk(
  'tables/setCurrentTable',
  async (currentTable) => {
    AsyncStorage.setItem("currentTable",`${currentTable}`);
    return currentTable;
});

export const setTable = createAsyncThunk(
  'tables/setTable',
  async ({tableIndex,table},{getState}) => {

    const tables = JSON.parse(JSON.stringify(getState().tables.tables));
    tables[tableIndex] = table;

    await AsyncStorage.setItem("tables",JSON.stringify(tables));

    return tables;
});


export const addNewTable = createAsyncThunk(
  'tables/addNewTable',
  async (tableTitle,{getState}) => {

    const tables = JSON.parse(JSON.stringify(getState().tables.tables));
    tables.push({
      ...tableTemplate,
      name: tableTitle
    });

    await AsyncStorage.setItem("tables",JSON.stringify(tables));

    return tables;
});

export const addImportedTable = createAsyncThunk(
  'tables/addImportedTable',
  async (importedTable,{getState}) => {

    const tables = JSON.parse(JSON.stringify(getState().tables.tables));
    tables.push(importedTable);

    await AsyncStorage.setItem("tables",JSON.stringify(tables));

    return tables;
});

export const deleteTable = createAsyncThunk(
  'tables/deleteTable',
  async (tableIndex,{getState}) => {

    let tables = JSON.parse(JSON.stringify(getState().tables.tables));
    tables = tables.filter((table,index) => index !== tableIndex);

    await AsyncStorage.setItem("tables",JSON.stringify(tables));

    return tables;
});

export const resetTable = createAsyncThunk(
  'tables/resetTable',
  async (tableIndex,{getState}) => {

    const tables = JSON.parse(JSON.stringify(getState().tables.tables));
    tables[tableIndex] = {...tableTemplate,name:tables[tableIndex].name};

    await AsyncStorage.setItem("tables",JSON.stringify(tables));

    return tables;
});

export const editTableTitle = createAsyncThunk(
  'tables/editTableTitle',
  async ({tableIndex,newTableTitle},{getState}) => {

    const tables = JSON.parse(JSON.stringify(getState().tables.tables));
    tables[tableIndex].name = newTableTitle;

    await AsyncStorage.setItem("tables",JSON.stringify(tables));

    return tables;
});

export const addPeriod = createAsyncThunk(
  'tables/addPeriod',
  async ({period, tableIndex},{getState}) => {

    const tables = JSON.parse(JSON.stringify(getState().tables.tables));
    tables[tableIndex].content[period.day].push(period);

    await AsyncStorage.setItem("tables",JSON.stringify(tables));

    return tables;
});

export const editPeriod = createAsyncThunk(
  'tables/editPeriod',
  async ({period, tableIndex},{getState}) => {

    const tables = JSON.parse(JSON.stringify(getState().tables.tables));
    tables[tableIndex].content[period.day][period.index] = period;

    await AsyncStorage.setItem("tables",JSON.stringify(tables));

    return tables;
});

export const deletePeriod = createAsyncThunk(
  'tables/deletePeriod',
  async ({period, tableIndex},{getState}) => {

    const tables = JSON.parse(JSON.stringify(getState().tables.tables));
    tables[tableIndex].content[period.day] = tables[tableIndex].content[period.day].filter((p,i) => i !== period.index);

    await AsyncStorage.setItem("tables",JSON.stringify(tables));

    return tables;
});



export const tablesSlice = createSlice({
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
        if(action.payload) state.tables = action.payload;
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

      //setCurrentTable
      .addCase(setCurrentTable.fulfilled, (state, action) => {
        state.currentTable = action.payload;
      })

      //setTable
      .addCase(setTable.fulfilled, (state, action) => {
        state.tables = action.payload;
      })


      //addNewTable
      .addCase(addNewTable.fulfilled, (state, action) => {
        state.tables = action.payload;
      })

      //addImportedTable
      .addCase(addImportedTable.fulfilled, (state, action) => {
        state.tables = action.payload;
      })

      //resetTable
      .addCase(resetTable.fulfilled, (state, action) => {
        state.tables = action.payload;
      })

      //deleteTable
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.tables = action.payload;
      })

      //editTableTitle
      .addCase(editTableTitle.fulfilled, (state, action) => {
        state.tables = action.payload;
      })


      //addPeriod
      .addCase(addPeriod.fulfilled, (state, action) => {
        state.tables = action.payload;
      })

      //editPeriod
      .addCase(editPeriod.fulfilled, (state, action) => {
        state.tables = action.payload;
      })

      //deletePeriod
      .addCase(deletePeriod.fulfilled, (state, action) => {
        state.tables = action.payload;
      })

    },
});

export default tablesSlice.reducer;