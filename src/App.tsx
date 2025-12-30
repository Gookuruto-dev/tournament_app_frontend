import { CssBaseline, ThemeProvider, createTheme, Container, AppBar, Toolbar, Typography, Tabs, Tab } from '@mui/material';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ParticipantList from './pages/ParticipantList';
import TournamentList from './pages/TournamentList';
import TournamentDetail from './pages/TournamentDetail';
import Dashboard from './pages/Dashboard';
import Archives from './pages/Archives';
import ArchiveIcon from '@mui/icons-material/Archive';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
  },
});


function App() {
  const location = useLocation();

  // Simple logic to highlight the correct tab
  const getTabValue = (path: string) => {
    if (path.startsWith('/participants')) return '/participants';
    if (path.startsWith('/tournaments')) return '/tournaments';
    if (path.startsWith('/archives')) return '/archives';
    return '/';
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ mr: 4 }}>
            BBX Tournament
          </Typography>
          <Tabs
            value={getTabValue(location.pathname)}
            textColor="inherit"
            indicatorColor="secondary"
            aria-label="navigation tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Dashboard" value="/" to="/" component={Link} icon={<DashboardIcon />} iconPosition="start" />
            <Tab label="Participants" value="/participants" to="/participants" component={Link} icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Tournaments" value="/tournaments" to="/tournaments" component={Link} icon={<EmojiEventsIcon />} iconPosition="start" />
            <Tab label="Archives" value="/archives" to="/archives" component={Link} icon={<ArchiveIcon />} iconPosition="start" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 10 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/participants" element={<ParticipantList />} />
          <Route path="/tournaments" element={<TournamentList />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/archives" element={<Archives />} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

export default App;
