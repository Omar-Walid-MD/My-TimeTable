import { configureStore } from '@reduxjs/toolkit'
import sliceReducer from './slice/slice'
import themeReducer from './slice/themeSlice'
export default configureStore({
  reducer: {
    tables: sliceReducer,
    theme: themeReducer
  },
})