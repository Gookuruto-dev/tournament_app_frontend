export interface Participant {
    ID: number;
    nickname: string;
    avatar: string;
    is_archived: boolean;
}

export interface Tournament {
    ID: number;
    name: string;
    date: string;
    status: string;
    is_archived: boolean;
}

export interface Match {
    ID: number;
    tournament_id: number;
    player1_id: number | null;
    player2_id: number | null;
    player1?: Participant;
    player2?: Participant;
    score_p1: number;
    score_p2: number;
    winner_id?: number | null;
    phase: string;
    round: number;
    next_match_id?: number | null;
    next_match_slot?: number;
}

export interface ParticipantStats {
    participant_id: number;
    nickname: string;
    total_wins: number;
    total_points: number;
    total_league_points: number;
    total_spin: number;
    total_burst: number;
    total_over: number;
    total_xtreme: number;
    tournaments_played: number;
}
