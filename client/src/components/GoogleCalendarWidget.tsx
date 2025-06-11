// GoogleCalendarWidget.tsx
import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

interface EventItem {
  id: number;
  summary: string;
  description: string;
  start: Date;
}

export default function GoogleCalendarWidget() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [error, setError] = useState<string | null>(null);
  const [displayDate, setDisplayDate] = useState<string>('');
  const [today, setToday] = useState<EventItem[]>([]);
  const [tomorrow, setTomorrow] = useState<EventItem[]>([]);

  async function fetchEvents() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(+start);
    end.setDate(end.getDate() + 2);

    const url = `http://localhost:3000/?start=${start.toISOString()}&end=${end.toISOString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        setError(`Response status: ${response.status}`);
        return
      }

      const json = await response.json();
      console.log(json);
      console.log(start.toLocaleDateString());
      let pt: EventItem[] = [];
      let ptom: EventItem[] = [];

      json.forEach((item: any) => {

        const istart = new Date(item.start.dateTime);
        istart.setHours(0, 0, 0, 0);

        let attending = false;

        if (item.attendees) {
          item.attendees.map((attendee) => {
            if (attendee.self === true) {
              attending = attendee.responseStatus == 'accepted';
            }
          });
        } else {
          attending = true;
        }

        let description = item.description || '';
        if (description.trim().length === 0) {
          description = 'No description available';
        }

        if (attending) {
          if (start - istart == 0) {

            pt.push({
              id: item.id,
              summary: item.summary,
              description: description,
              start: new Date(item.start.dateTime || item.start.date + 'T00:00:00-04:00')
            });

          } else {

            ptom.push({
              id: item.id,
              summary: item.summary,
              description: description,
              start: new Date(item.start.dateTime || item.start.date + 'T00:00:00-04:00')
            });

          }
        }
      })

      const options = {
  weekday: "short",
  month: "long",
  day: "numeric",
};
      setDisplayDate(start.toLocaleDateString('en-US', options));

      setToday(pt);
      setTomorrow(ptom);
    } catch (err: any) {
      console.error('Error fetching events:', err); 
      setError(err.details || err.message || 'An error occurred while fetching events');
    }
  }

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Grid container spacing={2} columns={2} sx={{ mb: (theme) => theme.spacing(2) }}
    >
      <Grid size={{ lg: 1, xs: 1, md: 1 }}>
        <Card >
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
              <Typography component="h2" variant="h6" sx={{ fontWeight: '600' }}>
                Today {displayDate}
              </Typography>
            </Stack>
            {today.map((event) => (
              <Card variant="outlined" key={event.id} sx={{ height: '100%' }}>
                <Box sx={{ p: 1 }}>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography gutterBottom variant="h5" component="div">
                      {event.summary}
                    </Typography>
                    <Typography gutterBottom variant="h6" component="div">
                      {event.start.toLocaleTimeString()}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {event.description}
                  </Typography>
                </Box>

              </Card>
            ))}
          </Stack>
        </Card>

      </Grid>
      <Grid size={{ lg: 1, xs: 1, md: 1 }}>
        <Card >
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
              <Typography component="h2" variant="h6" sx={{ fontWeight: '600' }}>
                Tomorrow
              </Typography>
            </Stack>
            {tomorrow.map((event) => (
              <Card variant="outlined" key={event.id} sx={{ height: '100%' }}>
                <Box sx={{ p: 1 }}>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography gutterBottom variant="h5" component="div">
                      {event.summary}
                    </Typography>
                    <Typography gutterBottom variant="h6" component="div">
                      {event.start.toLocaleTimeString()}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {event.description}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Stack>
        </Card>
      </Grid>
    </Grid>

  );
}