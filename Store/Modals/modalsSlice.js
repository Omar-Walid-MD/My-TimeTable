import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
    periodModalForm: null,
    periodInForm: null,
    periodToView: null,
    tableSettingsModal: null,
    addTableModal: null
}

export const setPeriodModalForm = createAsyncThunk(
  'modals/setPeriodModalForm',
  async (periodModalForm) => {
    return periodModalForm;
});

export const setPeriodInForm = createAsyncThunk(
  'modals/setPeriodInForm',
  async (periodInForm) => {
    return periodInForm;
});

export const setPeriodToView = createAsyncThunk(
    'modals/setPeriodToView',
    async (periodToView) => {
      return periodToView;
});

export const setTableSettingsModal = createAsyncThunk(
    'modals/setTableSettingsModal',
    async (tableSettingsModal) => {
      return tableSettingsModal;
});

export const setAddTableModal = createAsyncThunk(
    'modals/setAddTableModal',
    async (addTableModal) => {
      return addTableModal;
});

export const modalsSlice = createSlice({
    name: "modals",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder

       //setPeriodModalForm
       .addCase(setPeriodModalForm.fulfilled, (state, action) => {
        state.periodModalForm = action.payload;
        
        if(action.payload===null)
        {
          state.periodInForm = null;
        }
      })

       //setPeriodInForm
       .addCase(setPeriodInForm.fulfilled, (state, action) => {
        state.periodInForm = action.payload;
      })

      //setPeriodToView
      .addCase(setPeriodToView.fulfilled, (state, action) => {
        state.periodToView = action.payload;
      })

      //setTableSettingsModal
      .addCase(setTableSettingsModal.fulfilled, (state, action) => {
        state.tableSettingsModal = action.payload;
      })

      //setAddTableModal
      .addCase(setAddTableModal.fulfilled, (state, action) => {
        state.addTableModal = action.payload;
      })
    },
});

export default modalsSlice.reducer;