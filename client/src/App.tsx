import * as React from 'react';
import type { } from '@mui/x-charts/themeAugmentation';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MainGrid from './components/MainGrid';
import AppTheme from './shared-theme/AppTheme';

import {
  chartsCustomizations,
  dataGridCustomizations,
} from './shared-theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
};

export default function App(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        {/* Main content */}
        <Box
          component="main"
          sx={() => ({
            flexGrow: 1,
            background: 'linear-gradient(#007294, #093b58)',
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <MainGrid />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
