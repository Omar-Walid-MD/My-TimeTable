import { configureStore } from '@reduxjs/toolkit'
import sliceReducer from './slice/slice'
export default configureStore({
  reducer: {
    tables: sliceReducer,
  },
})