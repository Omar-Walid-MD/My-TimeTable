import { configureStore } from '@reduxjs/toolkit'
import sliceReducer from './slice/slice'
import settingsReducer from './slice/settingsSlice'
import popupsReducer from './slice/popupsSlice'
export default configureStore({
  reducer: {
    tables: sliceReducer,
    settings: settingsReducer,
    popups: popupsReducer
  },
})