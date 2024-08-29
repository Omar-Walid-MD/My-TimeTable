import { configureStore } from '@reduxjs/toolkit'
import tablesReducer from './Tables/tablesSlice'
import settingsReducer from './Settings/settingsSlice'
import popupsReducer from './Popups/popupsSlice'
import modalsReducer from './Modals/modalsSlice'

export default configureStore({
  reducer: {
    tables: tablesReducer,
    settings: settingsReducer,
    popups: popupsReducer,
    modals: modalsReducer
  },
})