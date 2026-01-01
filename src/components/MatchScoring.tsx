import { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, Typography, Stack, Grid, TextField, useMediaQuery, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateMatchScore, resetMatch, manualScoreUpdate, fetchTournamentDetails } from '../store/tournamentsSlice';

interface MatchScoringProps {
    open: boolean;
    onClose: () => void;
    matchId: number | null;
}

const winTypes = [
    { label: 'Spin (1)', type: 'Spin', points: 1 },
    { label: 'Over (2)', type: 'Over', points: 2 },
    { label: 'Burst (2)', type: 'Burst', points: 2 },
    { label: 'Out (2)', type: 'Out', points: 2 },
    { label: 'Xtreme (3)', type: 'Xtreme', points: 3 },
];

const MatchScoring = ({ open, onClose, matchId }: MatchScoringProps) => {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    // Select match from store to ensure live updates
    const match = useAppSelector((state) =>
        state.tournaments.currentTournament?.matches?.find((m: any) => m.ID === matchId)
    );

    // Local state for manual adjustments
    const [editMode, setEditMode] = useState(false);
    const [manualP1, setManualP1] = useState(0);
    const [manualP2, setManualP2] = useState(0);

    const handleScore = async (winnerId: number, winType: string) => {
        if (match) {
            await dispatch(updateMatchScore({ matchId: match.ID, winnerId, winType }));
            dispatch(fetchTournamentDetails(match.tournament_id));
        }
    };

    const handleReset = async () => {
        if (match) {
            if (confirm('Are you sure you want to reset this match? Scores will be cleared.')) {
                await dispatch(resetMatch(match.ID));
                dispatch(fetchTournamentDetails(match.tournament_id));
            }
        }
    };

    const toggleEditMode = () => {
        if (!editMode && match) {
            setManualP1(match.score_p1);
            setManualP2(match.score_p2);
        }
        setEditMode(!editMode);
    };

    const saveManualScore = () => {
        if (match) {
            dispatch(manualScoreUpdate({ matchId: match.ID, scoreP1: manualP1, scoreP2: manualP2 }));
            setEditMode(false);
        }
    };

    if (!matchId || !match) return null;

    const isFinished = !!match.winner_id;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Match Scoring
                <Button size="small" onClick={toggleEditMode}>{editMode ? 'Cancel Edit' : 'Edit Score'}</Button>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    {!editMode ? (
                        <>
                            <Typography variant="h4">{match.score_p1} - {match.score_p2}</Typography>
                            <Typography variant="subtitle1">Target: {match.phase === 'Bracket' ? 10 : 7}</Typography>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <TextField
                                label="P1 Score"
                                type="number"
                                value={manualP1}
                                onChange={(e) => setManualP1(Number(e.target.value))}
                                size="small"
                                sx={{ width: 80 }}
                            />
                            <Typography>-</Typography>
                            <TextField
                                label="P2 Score"
                                type="number"
                                value={manualP2}
                                onChange={(e) => setManualP2(Number(e.target.value))}
                                size="small"
                                sx={{ width: 80 }}
                            />
                            <Button variant="contained" onClick={saveManualScore}>Save</Button>
                        </Box>
                    )}

                    {isFinished && !editMode && <Typography variant="h5" color="primary">Match Finished!</Typography>}
                </Box>

                {!isFinished && !editMode && (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ border: '1px solid #444', p: 2, borderRadius: 2 }}>
                                <Typography variant="h6" align="center" gutterBottom>{match.player1?.nickname}</Typography>
                                <Stack spacing={1}>
                                    {winTypes.map((wt) => (
                                        <Button
                                            key={wt.type}
                                            variant="outlined"
                                            onClick={() => handleScore(match.player1_id, wt.type)}
                                            size={fullScreen ? 'medium' : 'small'}
                                        >
                                            {wt.label}
                                        </Button>
                                    ))}
                                </Stack>
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ border: '1px solid #444', p: 2, borderRadius: 2 }}>
                                <Typography variant="h6" align="center" gutterBottom>{match.player2?.nickname}</Typography>
                                <Stack spacing={1}>
                                    {winTypes.map((wt) => (
                                        <Button
                                            key={wt.type}
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handleScore(match.player2_id, wt.type)}
                                            size={fullScreen ? 'medium' : 'small'}
                                        >
                                            {wt.label}
                                        </Button>
                                    ))}
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Button color="error" variant="outlined" onClick={handleReset}>Restart Match</Button>
                    <Button variant="contained" onClick={onClose}>Close</Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default MatchScoring;
