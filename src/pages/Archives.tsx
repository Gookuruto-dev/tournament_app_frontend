import { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { fetchParticipants } from '../store/participantsSlice';
import { fetchTournaments, unarchiveTournament } from '../store/tournamentsSlice';
import type { Participant, Tournament } from '../types';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Tabs,
    Tab,
    Divider,
    Stack,
    IconButton
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Unarchive } from '@mui/icons-material';

const Archives = () => {
    const dispatch = useAppDispatch();
    const [tab, setTab] = useState(0);
    const [archivedParticipants, setArchivedParticipants] = useState<Participant[]>([]);
    const [archivedTournaments, setArchivedTournaments] = useState<Tournament[]>([]);

    useEffect(() => {
        dispatch(fetchParticipants(true)).then((action: any) => {
            if (action.payload) {
                setArchivedParticipants(action.payload.filter((p: Participant) => p.is_archived));
            }
        });
        dispatch(fetchTournaments(true)).then((action: any) => {
            if (action.payload) {
                setArchivedTournaments(action.payload.filter((t: Tournament) => t.is_archived));
            }
        });
    }, [dispatch]);

    function handleUnarchive(ID: number): void {
        dispatch(unarchiveTournament(ID));
    }

    return (
        <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                <InventoryIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                <Typography variant="h4" fontWeight="bold">Archives</Typography>
            </Stack>

            <Paper sx={{ mb: 4 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
                    <Tab label={`Participants (${archivedParticipants.length})`} />
                    <Tab label={`Tournaments (${archivedTournaments.length})`} />
                </Tabs>
            </Paper>

            {tab === 0 && (
                <List>
                    {archivedParticipants.map((p) => (
                        <ListItem key={p.ID} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 2, opacity: 0.7 }}>
                            <ListItemText primary={p.nickname} secondary={`Original ID: ${p.ID}`} />
                        </ListItem>
                    ))}
                    {archivedParticipants.length === 0 && (
                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No archived participants.</Typography>
                    )}
                </List>
            )}

            {tab === 1 && (
                <List>
                    {archivedTournaments.map((t) => (
                        <ListItem key={t.ID} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 2, opacity: 0.7 }} secondaryAction={
                            <IconButton edge="end" aria-label="archive" onClick={() => handleUnarchive(t.ID)}>
                                <Unarchive />
                            </IconButton>
                        }>
                            <ListItemText primary={t.name} secondary={`Finished on: ${new Date(t.date).toLocaleDateString()}`} />
                        </ListItem>
                    ))}
                    {archivedTournaments.length === 0 && (
                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No archived tournaments.</Typography>
                    )}
                </List>
            )}

            <Divider sx={{ my: 4 }} />
            <Typography variant="body2" color="text.secondary" align="center">
                Archived items are hidden from the main library and active tournament selections.
            </Typography>
        </Box>
    );
};

export default Archives;
