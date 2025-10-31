import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import WeatherWidget from './WeatherWidget';
import CalendarWidget from './CalendarWidget';

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', pt: '1rem', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        <Grid size={{ lg: 8, xs: 8, md: 6 }}>
          <CalendarWidget />
        </Grid>
        <Grid size={{ lg: 4, xs: 4, md: 4 }}>
          <WeatherWidget lat={42.7233} lon={-78.8390} />
        </Grid>
      </Grid>
    </Box>
  );
}
