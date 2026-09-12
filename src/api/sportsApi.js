import axios from 'axios';

const DEV_URLS = {
  sportscore: '/sportscore',
  sofascore: '/sofascore/api/v1',
  thesportsdb: '/thesportsdb/api/v1/json/3',
};

const proxy = async (api, path, params = {}) => {
  try {
    const isDev = import.meta.env.DEV;
    let url, reqParams;
    if (isDev) {
      url = `${DEV_URLS[api]}/${path}`;
      reqParams = params;
    } else {
      url = '/api/proxy';
      reqParams = { api, path, ...params };
    }
    const resp = await axios.get(url, { params: reqParams, timeout: 15000 });
    return resp.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message || 'API request failed');
  }
};

const cleanSlug = (slug) => {
  let s = slug;
  if (s.includes('/match/')) s = s.split('/match/')[1] || s;
  return s.replace(/^\/+|\/+$/g, '') || 'unknown';
};

const matchTeams = (sportScoreSlug, sofascoreEvent) => {
  const s = sportScoreSlug.toLowerCase().replace(/-/g, ' ');
  const home = (sofascoreEvent.homeTeam?.name || '').toLowerCase();
  const away = (sofascoreEvent.awayTeam?.name || '').toLowerCase();
  return s.includes(home) || s.includes(away) || home.includes(s) || away.includes(s);
};

const formatCricketFromSportScore = (match) => {
  const slug = cleanSlug(match.url);
  return {
    home: match.home || 'Team 1', away: match.away || 'Team 2',
    home_score: match.home_score ?? '-', away_score: match.away_score ?? '-',
    status: match.status || 'scheduled', status_text: match.status_text || '',
    competition: match.competition || '', time: match.time || null,
    url: `/cricket/match/${slug}`, home_logo: match.home_logo, away_logo: match.away_logo,
    _slug: slug, _source: 'sportscore',
  };
};

const formatCricketFromSofascore = (event) => {
  const homeTeam = event.homeTeam?.name || 'Team 1';
  const awayTeam = event.awayTeam?.name || 'Team 2';
  const status = event.status?.type || 'unknown';
  const statusText = event.status?.description || '';
  const competition = event.tournament?.uniqueTournament?.name || event.tournament?.name || '';
  const sofaStatus = status === 'inprogress' ? 'live' : status === 'finished' ? 'finished' : 'scheduled';

  const homeInnings = event.homeScore?.innings || {};
  const awayInnings = event.awayScore?.innings || {};
  const periods = event.periods || {};

  const parseInnings = (obj) => Object.entries(obj).map(([key, inn]) => ({
    label: periods[key] || key, score: inn.score ?? 0, wickets: inn.wickets ?? 0,
    overs: inn.overs ?? 0, runRate: inn.runRate ?? 0,
  }));

  let homeScoreText = event.homeScore?.current != null ? String(event.homeScore.current) : '-';
  let awayScoreText = event.awayScore?.current != null ? String(event.awayScore.current) : '-';

  if (Object.keys(homeInnings).length > 0) {
    const inn = homeInnings[Object.keys(homeInnings).pop()];
    if (inn) homeScoreText = `${inn.score ?? 0}/${inn.wickets ?? 0} (${inn.overs ?? 0} ov)`;
  }
  if (Object.keys(awayInnings).length > 0) {
    const inn = awayInnings[Object.keys(awayInnings).pop()];
    if (inn) awayScoreText = `${inn.score ?? 0}/${inn.wickets ?? 0} (${inn.overs ?? 0} ov)`;
  }

  return {
    home: homeTeam, away: awayTeam, home_score: homeScoreText, away_score: awayScoreText,
    status: sofaStatus, status_text: statusText, competition,
    time: event.startTimestamp ? new Date(event.startTimestamp * 1000).toISOString() : null,
    url: `/cricket/match/${event.slug || 'unknown'}`, home_logo: null, away_logo: null,
    venue: event.venue ? { name: event.venue.name, city: event.venue.city?.name, country: event.venue.country?.name } : null,
    toss: event.tossWin ? { winner: event.tossWin, decision: event.tossDecision } : null,
    currentPeriod: event.periods?.current || '',
    homeInnings: parseInnings(homeInnings), awayInnings: parseInnings(awayInnings),
    _cricket: true, _source: 'sofascore', _slug: event.slug, _sofascoreId: event.id,
  };
};

const formatFromTheSportsDB = (event, sport) => {
  const statusMap = { 'NS': 'scheduled', 'FT': 'finished', '1H': 'live', '2H': 'live', 'BT': 'live', 'P': 'live', 'ET': 'live', 'AOT': 'live' };
  const status = statusMap[event.strStatus] || 'scheduled';

  return {
    home: event.strHomeTeam || 'Team 1', away: event.strAwayTeam || 'Team 2',
    home_score: event.intHomeScore ?? '-', away_score: event.intAwayScore ?? '-',
    status, status_text: event.strStatus || '', competition: event.strLeague || '',
    time: event.strTimestamp || null, url: `/${sport}/match/${event.idEvent}`,
    home_logo: event.strHomeTeamBadge || null, away_logo: event.strAwayTeamBadge || null,
    _slug: event.idEvent, _source: 'thesportsdb', _eventId: event.idEvent,
  };
};

export const getLiveMatches = async (sport) => {
  if (sport === 'all' || sport === 'All') return getAllSportsMatches();
  if (sport === 'cricket') return getCricketMatches();
  if (sport === 'badminton') return getBadmintonMatches();
  if (sport === 'hockey') return getHockeyMatches();
  if (sport === 'kabaddi') return { matches: [] };
  const apiSport = { football: 'football', tennis: 'tennis', basketball: 'basketball' }[sport];
  if (!apiSport) return { matches: [] };
  return await proxy('sportscore', 'api/widget/matches/', { sport: apiSport, limit: 30 });
};

const getAllSportsMatches = async () => {
  const sports = ['football', 'cricket', 'basketball', 'tennis', 'badminton', 'hockey'];
  const results = await Promise.allSettled(
    sports.map((s) => getLiveMatches(s).then((d) => (d?.matches || []).map((m) => ({ ...m, _sport: s }))))
  );
  const allMatches = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);
  return { matches: allMatches };
};

const getCricketMatches = async () => {
  try {
    const [sportscoreResp, sofascoreResp] = await Promise.all([
      proxy('sportscore', 'api/widget/matches/', { sport: 'cricket', limit: 30 }).catch(() => ({ matches: [] })),
      proxy('sofascore', 'sport/cricket/events/live').catch(() => ({ events: [] })),
    ]);
    const sportscoreMatches = (sportscoreResp?.matches || []).map(formatCricketFromSportScore);
    const sofascoreEvents = sofascoreResp?.events || [];
    const enriched = sportscoreMatches.map((scMatch) => {
      const sofaMatch = sofascoreEvents.find((e) => matchTeams(scMatch._slug, e));
      if (sofaMatch) {
        const enriched = formatCricketFromSofascore(sofaMatch);
        enriched.home_logo = scMatch.home_logo;
        enriched.away_logo = scMatch.away_logo;
        enriched._sportscore_slug = scMatch._slug;
        return enriched;
      }
      return scMatch;
    });
    const sofascoreOnly = sofascoreEvents.filter((e) => !enriched.some((m) => m._sofascoreId === e.id))
      .map(formatCricketFromSofascore);
    return { matches: [...enriched, ...sofascoreOnly] };
  } catch (error) {
    return { matches: [] };
  }
};

const getBadmintonMatches = async () => {
  try {
    const resp = await proxy('thesportsdb', 'eventsday.php', { d: new Date().toISOString().split('T')[0], s: 'Badminton' });
    const events = resp?.events || [];
    return { matches: events.map((e) => formatFromTheSportsDB(e, 'badminton')) };
  } catch (error) {
    return { matches: [] };
  }
};

const getHockeyMatches = async () => {
  try {
    const resp = await proxy('thesportsdb', 'livescore.php', { s: 'Ice Hockey' });
    const events = resp?.livescore || [];
    return { matches: events.map((e) => formatFromTheSportsDB(e, 'hockey')) };
  } catch (error) {
    return { matches: [] };
  }
};

export const getMatchDetail = async (sport, slug) => {
  const clean = slug.replace(/^\/+|\/+$/g, '').replace(/^.*match\//, '');
  if (sport === 'cricket') return getCricketMatchDetail(clean);
  if (sport === 'badminton' || sport === 'hockey') return getTheSportsDBMatchDetail(sport, clean);
  const apiSport = { football: 'football', tennis: 'tennis', basketball: 'basketball' }[sport];
  if (!apiSport) return null;
  try {
    const response = await proxy('sportscore', 'api/widget/match/', { sport: apiSport, slug: clean });
    return response?.match || response;
  } catch (e) {
    return null;
  }
};

const findSofascoreMatch = async (slug) => {
  const endpoints = [
    'sport/cricket/events/live',
    'sport/cricket/events/next/0',
    'sport/cricket/events/last/0',
  ];
  for (const endpoint of endpoints) {
    try {
      const resp = await proxy('sofascore', endpoint);
      const events = resp?.events || [];
      let match = events.find((e) => e.slug === slug);
      if (!match) match = events.find((e) => matchTeams(slug, e));
      if (match) return match;
    } catch (e) {}
  }
  return null;
};

const getCricketMatchDetail = async (slug) => {
  const s = cleanSlug(slug);
  const sofascoreMatch = await findSofascoreMatch(s);
  if (sofascoreMatch) return formatCricketFromSofascore(sofascoreMatch);
  try {
    const resp = await proxy('sportscore', 'api/widget/match/', { sport: 'cricket', slug: s });
    const match = resp?.match || resp;
    if (match && match.home) {
      return {
        home: match.home, away: match.away, home_score: match.home_score ?? '-', away_score: match.away_score ?? '-',
        status: match.status || 'scheduled', status_text: match.status_text || '', competition: match.competition || '',
        time: match.time || null, url: `/cricket/match/${s}`, home_logo: match.home_logo, away_logo: match.away_logo,
        venue: null, toss: null, currentPeriod: match.status_text || '', homeInnings: [], awayInnings: [],
        _cricket: true, _source: 'sportscore', _slug: s,
      };
    }
  } catch (e) {}
  return null;
};

const getTheSportsDBMatchDetail = async (sport, eventId) => {
  try {
    const resp = await proxy('thesportsdb', 'lookupevent.php', { i: eventId });
    const event = resp?.events?.[0];
    if (!event) return null;
    return {
      home: event.strHomeTeam || 'Team 1', away: event.strAwayTeam || 'Team 2',
      home_score: event.intHomeScore ?? '-', away_score: event.intAwayScore ?? '-',
      status: event.strStatus === 'FT' ? 'finished' : event.strStatus === 'NS' ? 'scheduled' : 'live',
      status_text: event.strStatus || '', competition: event.strLeague || '',
      time: event.strTimestamp || null, url: `/${sport}/match/${event.idEvent}`,
      home_logo: event.strHomeTeamBadge || null, away_logo: event.strAwayTeamBadge || null,
      venue: event.strVenue || null, toss: null, currentPeriod: event.strProgress || '',
      homeInnings: [], awayInnings: [], _cricket: false, _source: 'thesportsdb', _slug: event.idEvent,
    };
  } catch (error) {
    return null;
  }
};

export const getStandings = async (sport, slug) => {
  const apiSport = { football: 'football', tennis: 'tennis', basketball: 'basketball' }[sport];
  if (!apiSport) return { data: [] };
  return await proxy('sportscore', 'api/widget/standings/', { sport: apiSport, slug });
};

export const searchTeams = async (sport, query) => {
  const q = query.toLowerCase();

  if (sport === 'cricket') {
    try {
      const resp = await proxy('sportscore', 'api/widget/matches/', { sport: 'cricket', limit: 30 });
      const matches = (resp?.matches || []).map(formatCricketFromSportScore).filter((m) =>
        m.home?.toLowerCase().includes(q) || m.away?.toLowerCase().includes(q)
      );
      return { matches };
    } catch { return { matches: [] }; }
  }

  if (sport === 'badminton') {
    try {
      const data = await getBadmintonMatches();
      return { matches: data.matches.filter((m) => m.home?.toLowerCase().includes(q) || m.away?.toLowerCase().includes(q)) };
    } catch { return { matches: [] }; }
  }

  if (sport === 'hockey') {
    try {
      const data = await getHockeyMatches();
      return { matches: data.matches.filter((m) => m.home?.toLowerCase().includes(q) || m.away?.toLowerCase().includes(q)) };
    } catch { return { matches: [] }; }
  }

  const apiSport = { football: 'football', tennis: 'tennis', basketball: 'basketball' }[sport];
  if (!apiSport) return { matches: [] };
  const resp = await proxy('sportscore', 'api/widget/matches/', { sport: apiSport, limit: 30 });
  if (resp?.matches) {
    return { ...resp, matches: resp.matches.filter((m) =>
      m.home?.toLowerCase().includes(q) || m.away?.toLowerCase().includes(q)
    )};
  }
  return resp;
};
