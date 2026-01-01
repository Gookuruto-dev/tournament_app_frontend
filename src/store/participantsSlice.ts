import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Participant } from '../types';
import { config } from '../config';

export interface ParticipantsState {
    list: Participant[];
    leagueStats: any[]; // ParticipantStats
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ParticipantsState = {
    list: [],
    leagueStats: [],
    status: 'idle',
    error: null,
};

export const fetchParticipants = createAsyncThunk('participants/fetchParticipants', async (includeArchived: boolean = false) => {
    const response = await fetch(`${config.apiUrl}/participants${includeArchived ? '?include_archived=true' : ''}`);
    if (!response.ok) {
        throw new Error('Failed to fetch participants');
    }
    return (await response.json()) as Participant[];
});

export const fetchLeagueStats = createAsyncThunk('participants/fetchLeagueStats', async () => {
    const response = await fetch(`${config.apiUrl}/stats`);
    if (!response.ok) {
        throw new Error('Failed to fetch league stats');
    }
    return (await response.json()) as any[];
});

export const addParticipant = createAsyncThunk('participants/addParticipant', async (newParticipant: Omit<Participant, 'ID'>) => {
    const response = await fetch(`${config.apiUrl}/participants`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParticipant),
    });
    if (!response.ok) {
        throw new Error('Failed to add participant');
    }
    return (await response.json()) as Participant;
});

export const archiveParticipant = createAsyncThunk('participants/archive', async (id: number) => {
    const response = await fetch(`${config.apiUrl}/participants/${id}/archive`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to archive participant');
    }
    return id;
});

const participantsSlice = createSlice({
    name: 'participants',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchParticipants.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchParticipants.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchParticipants.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Something went wrong';
            })
            .addCase(fetchLeagueStats.fulfilled, (state, action) => {
                state.leagueStats = action.payload;
            })
            .addCase(addParticipant.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })
            .addCase(archiveParticipant.fulfilled, (state, action) => {
                state.list = state.list.filter(p => p.ID !== action.payload);
            });
    },
});

export default participantsSlice.reducer;


