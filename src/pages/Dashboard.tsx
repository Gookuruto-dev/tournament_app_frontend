import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchLeagueStats } from '../store/participantsSlice';
import type { ParticipantsState } from '../store/participantsSlice';
import type { ParticipantStats } from '../types';
import {
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Card,
    CardContent,
    Avatar
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { RootState } from '../store';

const Dashboard = () => {
    const dispatch = useAppDispatch();
    const leagueStats = useAppSelector((state: RootState) => (state.participants as ParticipantsState).leagueStats);

    useEffect(() => {
        dispatch(fetchLeagueStats());
    }, [dispatch]);

    const topThreeIcons = [
        <EmojiEventsIcon key="gold" sx={{ color: '#ffd700' }} />, // Gold
        <EmojiEventsIcon key="silver" sx={{ color: '#c0c0c0' }} />, // Silver
        <EmojiEventsIcon key="bronze" sx={{ color: '#cd7f32' }} />, // Bronze
    ];

    return (
        <Box sx={{ flexGrow: 1, py: 4 }}>
            <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
                BBX League Dashboard
            </Typography>

            {/* Quick Stats Summary */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'primary.dark', color: 'white' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <MilitaryTechIcon sx={{ fontSize: 40 }} />
                            <Typography variant="h6">Total Participants</Typography>
                            <Typography variant="h4">{leagueStats?.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'secondary.dark', color: 'white' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <TrendingUpIcon sx={{ fontSize: 40 }} />
                            <Typography variant="h6">Current Leader</Typography>
                            <Typography variant="h4">{(leagueStats && leagueStats[0]?.nickname) || '-'}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'success.dark', color: 'white' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <EmojiEventsIcon sx={{ fontSize: 40 }} />
                            <Typography variant="h6">Max Points</Typography>
                            <Typography variant="h4">{(leagueStats && leagueStats[0]?.total_league_points) || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* League Table */}
            <Typography variant="h4" gutterBottom sx={{ mt: 4, fontWeight: 'medium' }}>
                League Standings
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 6 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'secondary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Player</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>LP</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Wins</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>T-Played</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Spin</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Burst</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Over</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Xtreme</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leagueStats.map((stat: ParticipantStats, index: number) => (
                            <TableRow key={stat.participant_id} sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                                <TableCell align="center">
                                    {index < 3 ? topThreeIcons[index] : index + 1}
                                </TableCell>
                                <TableCell sx={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: index === 0 ? 'primary.main' : 'grey.700' }}>
                                            {stat.nickname[0]}
                                        </Avatar>
                                        {stat.nickname}
                                    </Box>
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>{stat.total_league_points}</TableCell>
                                <TableCell align="center">{stat.total_wins}</TableCell>
                                <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{stat.tournaments_played}</TableCell>
                                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{stat.total_spin}</TableCell>
                                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{stat.total_burst}</TableCell>
                                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{stat.total_over}</TableCell>
                                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{stat.total_xtreme}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Dashboard;
