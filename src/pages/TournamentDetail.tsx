import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchTournamentDetails,
    addParticipantToTournament,
    generateGroups,
    generateMatches,
    advanceTournament,
    resetTournament,
    archiveTournament,
    removeParticipantFromTournament
} from '../store/tournamentsSlice';
import { fetchParticipants, addParticipant } from '../store/participantsSlice';
import type { ParticipantsState } from '../store/participantsSlice';
import {
    Box,
    Typography,
    Paper,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Card,
    CardContent,
    Grid,
    Autocomplete,
    TextField
} from '@mui/material';
import MatchScoring from '../components/MatchScoring';
import ConfirmDialog from '../components/ConfirmDialog';
import type { RootState } from '../store';

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const tournament = useAppSelector((state: RootState) => state.tournaments.currentTournament);
    const allParticipants = useAppSelector((state: RootState) => (state.participants as ParticipantsState).list);

    const [selectedParticipant, setSelectedParticipant] = useState<number | ''>('');
    const [mainTab, setMainTab] = useState(0); // 0: Standings, 1: Matches
    const [groupTab, setGroupTab] = useState(0);
    const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
    const [scoringMatchId, setScoringMatchId] = useState<number | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        if (id) {
            dispatch(fetchTournamentDetails(Number(id)));
            dispatch(fetchParticipants(false));
        }
    }, [dispatch, id]);

    if (!tournament) return <Typography sx={{ m: 4 }}>Loading...</Typography>;

    const handleAddParticipant = () => {
        if (id && selectedParticipant) {
            dispatch(addParticipantToTournament({
                tournamentId: Number(id),
                participantId: Number(selectedParticipant)
            })).then(() => {
                dispatch(fetchTournamentDetails(Number(id)));
                setSelectedParticipant('');
            });
        }
    };

    const handleArchive = () => {
        if (id && window.confirm("Archive this tournament?")) {
            dispatch(archiveTournament(Number(id))).then(() => {
                navigate('/tournaments');
            });
        }
    };

    // Logic helpers
    const groups = Array.from(new Set(tournament.tournament_participants?.map(tp => tp.group).filter(g => g))).sort();
    const hasBracket = tournament.matches?.some(m => m.phase === 'Bracket');
    const groupTabs = groups.length > 0 ? (hasBracket ? ["Bracket", ...groups] : ["All", ...groups]) : ["Matches"];
    const currentGroupFilter = groupTabs[groupTab];
    const availableRounds = Array.from(new Set(tournament.matches?.filter(m => m.phase === currentGroupFilter || currentGroupFilter === "All").map(m => m.round))).sort((a, b) => a - b);

    const filteredMatches = (tournament.matches || []).filter((m: any) => {
        if (currentGroupFilter === "Bracket") return m.phase === "Bracket";
        const matchesGroup = currentGroupFilter === "All" || groupTabs.length === 1 || m.phase === currentGroupFilter;
        const matchesRound = selectedRound === 'all' || m.round === selectedRound;
        return matchesGroup && matchesRound;
    });

    return (
        <Box sx={{ pb: 8 }}>
            {/* Header Area */}
            <Paper sx={{ p: 4, mb: 4, borderRadius: 2, background: 'linear-gradient(45deg, #1e3a8a 30%, #1d4ed8 90%)', color: 'white' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h3" fontWeight="bold">{tournament.name}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip label={tournament.status} color="secondary" size="small" />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {new Date(tournament.date).toLocaleDateString()}
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                        <Button variant="outlined" color="inherit" onClick={handleArchive} sx={{ borderColor: 'rgba(255,255,255,0.5)' }}>
                            Archive Tournament
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Tabs
                value={mainTab}
                onChange={(_, v) => setMainTab(v)}
                sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
                textColor="primary"
                indicatorColor="primary"
            >
                <Tab label="Registration & Standings" />
                <Tab label="Matches & Bracket" />
            </Tabs>

            {mainTab === 0 && (
                <Grid container spacing={3}>
                    {/* Left: Registration & Controls */}
                    <Grid size={{ xs: 12, lg: 3 }}>
                        <Stack spacing={3}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Registration</Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                                        {tournament.tournament_participants?.map((tp) => (
                                            <Chip
                                                key={tp.ID}
                                                label={tp.participant.nickname}
                                                size="small"
                                                onDelete={tournament.status === 'Created' ? () => {
                                                    setConfirmDialog({
                                                        open: true,
                                                        title: 'Remove Participant',
                                                        message: `Are you sure you want to remove ${tp.participant.nickname} from this tournament?`,
                                                        onConfirm: () => {
                                                            if (id) {
                                                                dispatch(removeParticipantFromTournament({
                                                                    tournamentId: Number(id),
                                                                    participantId: tp.participant_id
                                                                })).then(() => {
                                                                    dispatch(fetchTournamentDetails(Number(id)));
                                                                });
                                                            }
                                                            setConfirmDialog({ ...confirmDialog, open: false });
                                                        }
                                                    });
                                                } : undefined}
                                            />
                                        ))}
                                    </Stack>

                                    {tournament.status === 'Created' && (
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                            <Autocomplete
                                                options={allParticipants}
                                                getOptionLabel={(option) => typeof option === 'string' ? option : option.nickname}
                                                value={allParticipants.find(p => p.ID === selectedParticipant) || null}
                                                onChange={(_, newValue) => {
                                                    if (newValue && typeof newValue !== 'string') {
                                                        setSelectedParticipant(newValue.ID);
                                                    }
                                                }}
                                                onInputChange={(_, newInputValue) => {
                                                    // Check if user pressed Enter with a new name
                                                    if (newInputValue && !allParticipants.some(p => p.nickname.toLowerCase() === newInputValue.toLowerCase())) {
                                                        // This will be handled by onKeyDown
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Add Player"
                                                        size="small"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const inputValue = (e.target as HTMLInputElement).value;
                                                                if (inputValue && !allParticipants.some(p => p.nickname.toLowerCase() === inputValue.toLowerCase())) {
                                                                    e.preventDefault();
                                                                    if (window.confirm(`Create new participant "${inputValue}"?`)) {
                                                                        dispatch(addParticipant({ nickname: inputValue, is_archived: false, avatar: '' })).then(() => {
                                                                            dispatch(fetchParticipants(false));
                                                                        });
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                )}
                                                freeSolo
                                                fullWidth
                                                size="small"
                                            />
                                            <Button variant="contained" onClick={handleAddParticipant} disabled={!selectedParticipant}>
                                                Add to Tournament
                                            </Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Tournament Management</Typography>
                                    <Stack spacing={2}>
                                        {tournament.status === 'Created' && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => id && dispatch(generateGroups(Number(id))).then(() => dispatch(fetchTournamentDetails(Number(id))))}
                                            >
                                                Step 1: Generate Groups
                                            </Button>
                                        )}
                                        {tournament.status === 'GroupsGenerated' && (
                                            <>
                                                <Button variant="outlined" onClick={() => id && dispatch(generateGroups(Number(id))).then(() => dispatch(fetchTournamentDetails(Number(id))))}>
                                                    Regenerate Groups
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => id && dispatch(generateMatches(Number(id))).then(() => dispatch(fetchTournamentDetails(Number(id))))}
                                                >
                                                    Step 2: Generate Matches
                                                </Button>
                                            </>
                                        )}
                                        {tournament.status === 'InProgress' && (
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                onClick={() => id && dispatch(advanceTournament(Number(id))).then(() => dispatch(fetchTournamentDetails(Number(id))))}
                                            >
                                                Advance to Bracket Phase
                                            </Button>
                                        )}
                                        {tournament.status === 'BracketInProgress' && (
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                onClick={() => id && dispatch(advanceTournament(Number(id))).then(() => dispatch(fetchTournamentDetails(Number(id))))}
                                            >
                                                Advance Round / Finish
                                            </Button>
                                        )}
                                        {tournament.status !== 'Created' && (
                                            <Button
                                                variant="text"
                                                color="error"
                                                onClick={() => {
                                                    if (window.confirm("RESET tournament? This deletes all matches!")) {
                                                        id && dispatch(resetTournament(Number(id))).then(() => dispatch(fetchTournamentDetails(Number(id))));
                                                    }
                                                }}
                                            >
                                                Reset Tournament
                                            </Button>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>

                    {/* Right: Standings */}
                    <Grid size={{ xs: 12, lg: 9 }}>
                        {groups.length === 0 && (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">Register players and generate groups to see standings.</Typography>
                            </Paper>
                        )}
                        <Grid container spacing={3}>
                            {groups.map(groupName => (
                                <Grid size={{ xs: 12, md: 12, xl: 6 }} key={groupName}>
                                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                                        <Typography variant="h5" color="primary" gutterBottom fontWeight="bold">Group {groupName} Standings</Typography>
                                        <TableContainer>
                                            <Table sx={{ tableLayout: 'auto', width: '100%' }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold', py: 2, wordBreak: 'break-word' }}>Player</TableCell>
                                                        <TableCell align="right" sx={{ fontSize: '1rem', fontWeight: 'bold', py: 2, width: '80px' }}>Pts</TableCell>
                                                        <TableCell align="right" sx={{ fontSize: '1rem', fontWeight: 'bold', py: 2, width: '80px' }}>W/L</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {tournament.tournament_participants
                                                        ?.filter(tp => tp.group === groupName)
                                                        .sort((a, b) => b.points - a.points || b.wins - a.wins)
                                                        .map((tp) => (
                                                            <TableRow key={tp.ID}>
                                                                <TableCell sx={{ fontSize: '0.95rem', py: 1.5 }}>{tp.participant.nickname}</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.95rem', py: 1.5 }}>{tp.points}</TableCell>
                                                                <TableCell align="right" sx={{ fontSize: '0.95rem', py: 1.5 }}>{tp.wins}-{tp.losses}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            )}

            {mainTab === 1 && (
                <Box>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={groupTab} onChange={(_, v) => setGroupTab(v)} variant="scrollable" scrollButtons="auto">
                            {groupTabs.map(g => <Tab key={g} label={g} />)}
                        </Tabs>
                    </Box>

                    {currentGroupFilter === "Bracket" ? (
                        <Box sx={{ display: 'flex', gap: 4, overflowX: 'auto', py: 4, minHeight: 400 }}>
                            {/* Group bracket matches by round */}
                            {Array.from(new Set(tournament.matches?.filter(m => m.phase === 'Bracket').map(m => m.round))).sort((a, b) => a - b).map(r => (
                                <Box key={r} sx={{ minWidth: 280, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <Typography variant="h6" align="center" sx={{ bgcolor: 'secondary.main', color: 'white', py: 1, borderRadius: 1 }}>
                                        {r === 1 ? "Quarter-finals" : r === 2 ? "Semi-finals" : r === 3 ? "Final" : `Round ${r}`}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'space-around', flexGrow: 1 }}>
                                        {tournament.matches?.filter(m => m.phase === 'Bracket' && m.round === r).map(match => (
                                            <Paper
                                                key={match.ID}
                                                onClick={() => setScoringMatchId(match.ID)}
                                                sx={{
                                                    p: 2,
                                                    cursor: 'pointer',
                                                    borderLeft: `5px solid ${match.winner_id ? '#4caf50' : '#ff9800'}`,
                                                    '&:hover': { bgcolor: 'action.hover', transform: 'scale(1.02)' },
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: (match.winner_id && match.winner_id === match.player1_id) ? 'bold' : 'normal' }}>
                                                        {match.player1?.nickname || "???"}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{match.score_p1}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: (match.winner_id && match.winner_id === match.player2_id) ? 'bold' : 'normal' }}>
                                                        {match.player2?.nickname || "???"}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{match.score_p2}</Typography>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                            {(tournament.matches?.filter(m => m.phase === 'Bracket').length === 0) && (
                                <Typography color="text.secondary">Bracket has not been generated yet.</Typography>
                            )}
                        </Box>
                    ) : (
                        <Box>
                            <FormControl size="small" sx={{ mb: 3, minWidth: 200 }}>
                                <InputLabel>Round</InputLabel>
                                <Select value={selectedRound} label="Round" onChange={(e) => setSelectedRound(e.target.value as any)}>
                                    <MenuItem value="all">All Rounds</MenuItem>
                                    {availableRounds.map(r => <MenuItem key={r} value={r}>Round {r}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <Stack spacing={2}>
                                {filteredMatches.map(match => (
                                    <Paper
                                        key={match.ID}
                                        onClick={() => setScoringMatchId(match.ID)}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            borderLeft: `5px solid ${match.winner_id ? '#4caf50' : '#ff9800'}`,
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="text.secondary">Round {match.round}</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: match.winner_id === match.player1_id ? 'bold' : 'normal' }}>
                                                    {match.player1?.nickname || '???'}
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ mx: 4 }}>{match.score_p1} - {match.score_p2}</Typography>
                                            <Box sx={{ flex: 1, textAlign: 'right' }}>
                                                <Typography variant="caption" color="text.secondary">&nbsp;</Typography>
                                                <Typography variant="h6" sx={{ fontWeight: match.winner_id === match.player2_id ? 'bold' : 'normal' }}>
                                                    {match.player2?.nickname || '???'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                ))}
                                {filteredMatches.length === 0 && <Typography align="center" color="text.secondary">No matches found.</Typography>}
                            </Stack>
                        </Box>
                    )}
                </Box>
            )}

            <MatchScoring
                open={!!scoringMatchId}
                matchId={scoringMatchId}
                onClose={() => setScoringMatchId(null)}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
                confirmColor="error"
                confirmText="Remove"
            />
        </Box>
    );
};

export default TournamentDetail;
