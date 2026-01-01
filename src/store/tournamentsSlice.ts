import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Tournament, Participant } from '../types';
import { config } from '../config';

interface TournamentDetail extends Tournament {
    participants: Participant[];
    tournament_participants: any[]; // New join table data
    matches: any[]; // TODO: Define Match type better
}

interface TournamentsState {
    list: Tournament[];
    currentTournament: TournamentDetail | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: TournamentsState = {
    list: [],
    currentTournament: null,
    status: 'idle',
    error: null,
};

export const fetchTournaments = createAsyncThunk('tournaments/fetchAll', async (includeArchived: boolean = false) => {
    const response = await fetch(`http://localhost:8081/tournaments${includeArchived ? '?include_archived=true' : ''}`);
    if (!response.ok) throw new Error('Failed to fetch tournaments');
    return (await response.json()) as Tournament[];
});

export const createTournament = createAsyncThunk('tournaments/create', async (name: string) => {
    const response = await fetch('http://localhost:8081/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create tournament');
    return (await response.json()) as Tournament;
});

export const fetchTournamentDetails = createAsyncThunk('tournaments/fetchOne', async (id: number) => {
    const response = await fetch(`http://localhost:8081/tournaments/${id}`);
    if (!response.ok) throw new Error('Failed to fetch tournament details');
    return (await response.json()) as TournamentDetail;
});

export const addParticipantToTournament = createAsyncThunk('tournaments/addParticipant',
    async ({ tournamentId, participantId }: { tournamentId: number, participantId: number }) => {
        const response = await fetch(`http://localhost:8081/tournaments/${tournamentId}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participant_id: participantId }),
        });
        if (!response.ok) throw new Error('Failed to add participant');
        return { tournamentId, participantId }; // Return payload to update UI optimistically or trigger refetch
    });

export const removeParticipantFromTournament = createAsyncThunk('tournaments/removeParticipant',
    async ({ tournamentId, participantId }: { tournamentId: number, participantId: number }) => {
        const response = await fetch(`http://localhost:8081/tournaments/${tournamentId}/participants/${participantId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove participant');
        return { tournamentId, participantId };
    });

export const startTournament = createAsyncThunk('tournaments/start', async (tournamentId: number) => {
    const response = await fetch(`http://localhost:8081/tournaments/${tournamentId}/start`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to start tournament');
    return (await response.json()) as Tournament; // Returns updated tournament
});

export const updateMatchScore = createAsyncThunk('matches/updateScore',
    async ({ matchId, winnerId, winType }: { matchId: number, winnerId: number, winType: string }) => {
        const response = await fetch(`http://localhost:8081/matches/${matchId}/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ winner_id: winnerId, win_type: winType }),
        });
        if (!response.ok) throw new Error('Failed to update score');
        return (await response.json()) as any; // Returns updated Match object
    });

export const resetMatch = createAsyncThunk('matches/reset', async (matchId: number) => {
    const response = await fetch(`http://localhost:8081/matches/${matchId}/reset`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset match');
    return (await response.json()) as any;
});

export const manualScoreUpdate = createAsyncThunk('matches/manualScore',
    async ({ matchId, scoreP1, scoreP2 }: { matchId: number, scoreP1: number, scoreP2: number }) => {
        const response = await fetch(`http://localhost:8081/matches/${matchId}/manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score_p1: scoreP1, score_p2: scoreP2 }),
        });
        if (!response.ok) throw new Error('Failed to manually update score');
        return (await response.json()) as any;
    });

export const advanceTournament = createAsyncThunk('tournaments/advance', async (tournamentId: number) => {
    const response = await fetch(`http://localhost:8081/tournaments/${tournamentId}/advance`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to advance tournament');
    return (await response.json()) as TournamentDetail; // Returns updated tournament object
});

export const archiveTournament = createAsyncThunk('tournaments/archive', async (id: number) => {
    const response = await fetch(`http://localhost:8081/tournaments/${id}/archive`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to archive tournament');
    return id;
});

export const generateGroups = createAsyncThunk('tournaments/generateGroups', async (tournamentId: number) => {
    const response = await fetch(`http://localhost:8081/tournaments/${tournamentId}/groups`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to generate groups');
    return (await response.json()) as TournamentDetail;
});

export const generateMatches = createAsyncThunk('tournaments/generateMatches', async (tournamentId: number) => {
    const response = await fetch(`http://localhost:8081/tournaments/${tournamentId}/matches`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to generate matches');
    return (await response.json()) as TournamentDetail;
});

export const resetTournament = createAsyncThunk('tournaments/reset', async (tournamentId: number) => {
    const response = await fetch(`http://localhost:8081/tournaments/${tournamentId}/reset`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset tournament');
    return (await response.json()) as { status: string };
});

const tournamentsSlice = createSlice({
    name: 'tournaments',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTournaments.fulfilled, (state, action) => {
                state.list = action.payload;
            })
            .addCase(createTournament.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })
            .addCase(fetchTournamentDetails.fulfilled, (state, action) => {
                state.currentTournament = action.payload;
            })
            .addCase(addParticipantToTournament.fulfilled, (state) => {
                // Maybe just refetch or handle manually. For now, simple.
            })
            .addCase(startTournament.fulfilled, (state, action) => {
                if (state.currentTournament && state.currentTournament.ID === action.payload.ID) {
                    state.currentTournament.status = action.payload.status;
                }
            })
            .addCase(updateMatchScore.fulfilled, (state, action) => {
                if (state.currentTournament && state.currentTournament.matches) {
                    const index = state.currentTournament.matches.findIndex((m: any) => m.ID === action.payload.ID);
                    if (index !== -1) {
                        state.currentTournament.matches[index] = action.payload;
                    }
                }
            })
            .addCase(resetMatch.fulfilled, (state, action) => {
                if (state.currentTournament && state.currentTournament.matches) {
                    const index = state.currentTournament.matches.findIndex((m: any) => m.ID === action.payload.ID);
                    if (index !== -1) {
                        state.currentTournament.matches[index] = action.payload;
                    }
                }
            })
            .addCase(manualScoreUpdate.fulfilled, (state, action) => {
                if (state.currentTournament && state.currentTournament.matches) {
                    const index = state.currentTournament.matches.findIndex((m: any) => m.ID === action.payload.ID);
                    if (index !== -1) {
                        state.currentTournament.matches[index] = action.payload;
                    }
                }
            })
            .addCase(advanceTournament.fulfilled, (state, action) => {
                state.currentTournament = action.payload;
            })
            .addCase(generateGroups.fulfilled, (state, action) => {
                state.currentTournament = action.payload;
            })
            .addCase(generateMatches.fulfilled, (state, action) => {
                state.currentTournament = action.payload;
            })
            .addCase(resetTournament.fulfilled, (state, action) => {
                if (state.currentTournament) {
                    state.currentTournament.status = action.payload.status;
                    state.currentTournament.matches = [];
                    // Optionally reset stats in state too, but refetching is safer
                }
            });
    },
});

export default tournamentsSlice.reducer;
