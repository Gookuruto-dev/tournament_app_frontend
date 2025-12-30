import { configureStore } from '@reduxjs/toolkit';
import participantsReducer from './participantsSlice';
import tournamentsReducer from './tournamentsSlice';

export const store = configureStore({
    reducer: {
        participants: participantsReducer,
        tournaments: tournamentsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
