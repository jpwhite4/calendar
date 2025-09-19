// CalendarWidget.tsx
import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';

interface EventItem {
  id: number;
  summary: string;
  description?: string;
  location?: string;
  start: Date;
}

export default function CalendarWidget() {

  // Used for display of error and loading status
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Calendar Event data
  const [calEvents, setCalEvents] = useState<EventItem[][]>([[], []]);
  const [displayDates, setDisplayDates] = useState<string[]>(['', '']);
  const [dayOffset, setDayOffset] = useState(0);

  // Used for tracking left and right swipes
  const [dragX, setDragX] = useState(null)

  const handleTouchStart = event => {
    const startDragX = event.changedTouches[0].clientX
    setDragX(startDragX);
  }

  const handleTouchEnd = event => {
    const endDragX = event.changedTouches[0].clientX
    const dragDelta = dragX - endDragX;
    let newOffset = null;

    if (dragDelta < -200) {
      newOffset = Math.max(0, dayOffset - 1);
    } else if (dragDelta > 200) {
      newOffset = Math.min(5, dayOffset + 1);
    }

    if (newOffset !== null && newOffset != dayOffset) {
      setDayOffset(newOffset);
    }
  }

  let lastUpdate = 0;

  useEffect(() => {
    let ignore = false;

    async function fetchEvents() {
      setLoading(true);
      setError(null);
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(+start);
      end.setDate(end.getDate() + 6);

      const url = `http://localhost:3000/?start=${start.toISOString()}&end=${end.toISOString()}`;

      try {
        const response = await fetch(url);
        if (ignore) {
          return
        }
        if (!response.ok) {
          setError(`Response status: ${response.status}`);
          return
        }

        const json = await response.json();
        let allCal: EventItem[][] = [];
        let calTimes: string[] = [];
        let pt: EventItem[] = [];
        let ptom: EventItem[] = [];

        for (let i = 0; i < 7; i++) {
            allCal.push([]);
        }

        json.forEach((item: any) => {

          const istart = new Date(item.start.dateTime);
          istart.setHours(0, 0, 0, 0);

          let attending = false;

          if (item.attendees) {
            item.attendees.map((attendee: { self: boolean; responseStatus: string; }) => {
              if (attendee.self === true) {
                attending = attendee.responseStatus == 'accepted';
              }
            });
          } else {
            attending = true;
          }

          let description = item.description || '';
          if (description.trim().length === 0) {
            description = null;
          }

          if (attending) {
             const dt = Math.floor((istart.getTime() - start.getTime()) / (24 * 3600 * 1000));
             if (dt >= 0 && dt < 7) {
                const istart =  new Date(item.start.dateTime || item.start.date + 'T00:00:00-04:00')
                allCal[dt].push({
                id: item.id,
                summary: item.summary,
                location: item.location ? item.location.split("\n")[0] : null,
                description: description,
                startDesc: item.allday ? '' : istart.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
                start: istart
              });
            }
          }
        })

        const options: Intl.DateTimeFormatOptions = {
          weekday: "short",
          month: "long",
          day: "numeric",
        };

        calTimes.push("Today " + start.toLocaleDateString('en-US', options));
        for (let i = 1; i < 7; i++) {
            const ndt = new Date(+start);
            ndt.setDate(ndt.getDate() + i);
            calTimes.push(ndt.toLocaleDateString('en-US', options));
        }
        setDisplayDates(calTimes);
        setCalEvents(allCal);
        lastUpdate = new Date().getTime();
      } catch (err: any) {
        setError(err.details || err.message || 'An error occurred while fetching events');
      } finally {
        setLoading(false);
      }
    }

    if (!ignore) {
      fetchEvents();
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      if (Math.abs(now - lastUpdate) > 60 * 60 * 1000) {
        fetchEvents();
      }
    }, 10 * 1000);

    return () => {
      clearInterval(interval);
      ignore = true; // Cleanup function to prevent state updates on unmounted component
    };
  }, []);

  if (loading) return <div>Loading calendar…</div>;

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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Grid size={{ lg: 1, xs: 1, md: 1 }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" sx={{ fontWeight: '600' }}>
              {displayDates[dayOffset]}
            </Typography>
          </Stack>
          {calEvents[dayOffset].map((event) => (
            <Card variant="outlined" key={event.id} sx={{ height: '100%' }}>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography gutterBottom variant="h5" component="div">
                  {event.summary}
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                  {event.startDesc}
                </Typography>
              </Stack>
              {event.location &&
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  {event.location}
                </Typography>
              }
              {event.description ??
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {event.description}
                </Typography>
              }

            </Card>
          ))}
        </Stack>

      </Grid>
      <Grid size={{ lg: 1, xs: 1, md: 1 }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" sx={{ fontWeight: '600' }}>
              {displayDates[dayOffset + 1]}
            </Typography>
          </Stack>
          {calEvents[dayOffset + 1].map((event) => (
            <Card key={event.id} sx={{ height: '100%' }}>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography gutterBottom variant="h5" component="div">
                  {event.summary}
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                  {event.startDesc}
                </Typography>
              </Stack>
              {event.location &&
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  {event.location}
                </Typography>
              }
              {event.description ??
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {event.description}
                </Typography>
              }
            </Card>
          ))}
        </Stack>
      </Grid>
    </Grid>

  );
}
