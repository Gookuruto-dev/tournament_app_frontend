import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTournaments, createTournament } from '../store/tournamentsSlice';
import { Box, Button, TextField, List, ListItem, ListItemText, Typography, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const TournamentList = () => {
    const dispatch = useAppDispatch();
    const { list } = useAppSelector((state) => state.tournaments);
    const [name, setName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchTournaments());
    }, [dispatch]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            dispatch(createTournament(name));
            setName('');
        }
    };

    const filteredTournaments = list.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>Tournaments</Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px' }}>
                    <TextField
                        label="Tournament Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                    />
                    <Button variant="contained" type="submit">Create</Button>
                </form>
            </Paper>

            <TextField
                label="Search Tournaments"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
                placeholder="Search by name or status..."
            />

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <List>
                    {filteredTournaments.map((t) => (
                        <ListItem key={t.ID} component={Link} to={`/tournaments/${t.ID}`} sx={{
                            bgcolor: 'background.paper', mb: 1, borderRadius: 1, textDecoration: 'none', color: 'inherit',
                            '&:hover': { bgcolor: 'action.hover' }
                        }}>
                            <ListItemText primary={t.name} secondary={`Status: ${t.status} | Date: ${new Date(t.date).toLocaleDateString()}`} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
};

export default TournamentList;
