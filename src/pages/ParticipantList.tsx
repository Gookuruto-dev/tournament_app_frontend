import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchParticipants, addParticipant, archiveParticipant } from '../store/participantsSlice';
import type { ParticipantsState } from '../store/participantsSlice';
import { Box, Button, TextField, List, ListItem, ListItemText, Typography, Paper, IconButton, Stack } from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Archive';
import type { RootState } from '../store';
import type { Participant } from '../types';

const ParticipantList = () => {
    const dispatch = useAppDispatch();
    const { list, status, error } = useAppSelector((state: RootState) => state.participants as ParticipantsState);
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        dispatch(fetchParticipants(false));
    }, [dispatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            dispatch(addParticipant({ nickname, avatar: '', is_archived: false }));
            setNickname('');
        }
    };

    const handleArchive = (id: number) => {
        if (window.confirm("Archive this participant?")) {
            dispatch(archiveParticipant(id));
        }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Participants Library</Typography>
            </Stack>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Add New Participant</Typography>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                    <TextField
                        label="Nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        fullWidth
                        size="small"
                        variant="outlined"
                    />
                    <Button variant="contained" type="submit" sx={{ px: 4 }}>Add</Button>
                </form>
            </Paper>

            {status === 'loading' && <Typography>Loading...</Typography>}
            {error && <Typography color="error">{error}</Typography>}

            <List sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {list.map((p: Participant) => (
                    <ListItem
                        key={p.ID || p.nickname}
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 1,
                            '&:hover': { boxShadow: 4 }
                        }}
                        secondaryAction={
                            <IconButton edge="end" aria-label="archive" onClick={() => handleArchive(p.ID)}>
                                <ArchiveIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText
                            primary={p.nickname}
                            secondary={`ID: ${p.ID}`}
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                        />
                    </ListItem>
                ))}
            </List>
            {list.length === 0 && status === 'succeeded' && (
                <Paper sx={{ p: 4, textAlign: 'center', opacity: 0.6 }}>
                    <Typography>No active participants in the library.</Typography>
                </Paper>
            )}
        </Box>
    );
};

export default ParticipantList;
