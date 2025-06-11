// WeatherWidget.tsx
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts';
import { useTheme } from '@mui/material/styles';

interface WeatherWidgetProps {
  lat: number;
  lon: number;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}
export default function WeatherWidget({ lat, lon }: WeatherWidgetProps) {
  const theme = useTheme();
  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];
  const [forecast, setForecast] = React.useState<string | null>(null);
  interface HourlyChartData {
    x: string[];
    temp: number[];
    rain: number[];
  }
  const [hourly, setHourly] = React.useState<HourlyChartData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ignore = false;
    
    async function fetchWeather() {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Get the forecast URL for the given point
        const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
        if (!pointRes.ok) throw new Error('Failed to fetch point data');
        const pointData = await pointRes.json();
        const forecastUrl = pointData.properties.forecast;

        // Step 2: Fetch the forecast
        const forecastRes = await fetch(forecastUrl);
        if (!forecastRes.ok) throw new Error('Failed to fetch forecast');
        const forecastData = await forecastRes.json();
        const period = forecastData.properties.periods[0];
        setForecast(`${period.name}: ${period.detailedForecast}`);

        // Get the hourly data and serialise it
        const hourly = await fetch(pointData.properties.forecastHourly);
        if (!hourly.ok) throw new Error('Failed to fetch hourly forecast');
        const hourlyData = await hourly.json();
        let chartData = { 'x': [], 'temp': [], 'rain': [] };

        for (let i = 0; i < Math.min(12, hourlyData.properties.periods.length); i++) {
          const p = hourlyData.properties.periods[i];

          chartData.x.push(new Date(p.startTime));
          chartData.temp.push(p.temperature);
          chartData.rain.push(p.probabilityOfPrecipitation ? p.probabilityOfPrecipitation.value : 0);
        }
        setHourly(chartData);

      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    console.log('in useEffect ignore = ', ignore);

    if (!ignore) {
      fetchWeather();
    }

    const interval = setInterval(() => {
      console.log('Interval triggered, fetching weather data again', new Date().toISOString() );
      fetchWeather();
    }, 30 * 60 * 1000);

    return () => {
      clearInterval(interval);
      ignore = true; // Cleanup function to prevent state updates on unmounted component
    };
  }, [lat, lon]);

  if (loading) return <div>Loading weather…</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          Weather
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '8px' }}>
          {forecast}
        </Typography>
        <LineChart
          colors={colorPalette}
          series={[
            { data: hourly?.temp, id: 'referral', label: 'Temperature', yAxisId: 'left', showMark: false }
          ]}
          xAxis={[{ scaleType: 'point', data: hourly?.x }]}
          yAxis={[
            {
              id: 'left', width: 50, label: 'Temp (°F)', colorMap: {
                type: 'piecewise',
                thresholds: [65, 75],
                colors: ['blue', 'green', 'red'],
              }, min: 32, max: 97
            }
          ]}
          height={250}
          hideLegend={true}
          margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-organic': {
              fill: "url('#organic')",
            },
            '& .MuiAreaElement-series-referral': {
              fill: "url('#referral')",
            },
            '& .MuiAreaElement-series-direct': {
              fill: "url('#direct')",
            },
          }}
        >
          <AreaGradient color={theme.palette.primary.dark} id="organic" />
          <AreaGradient color={theme.palette.primary.main} id="referral" />
          <AreaGradient color={theme.palette.primary.light} id="direct" />
        </LineChart>
        <LineChart
          colors={colorPalette}
          series={[
            { data: hourly?.rain, area: true, label: 'Rain Prob', id: 'organic', showMark: false }
          ]}
          xAxis={[{ scaleType: 'point', data: hourly?.x }]}
          yAxis={[
            { width: 50, min: 0, max: 100, label: 'Rain %' }
          ]}
          height={250}
          hideLegend={true}
          margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-organic': {
              fill: "url('#organic')",
            },
            '& .MuiAreaElement-series-referral': {
              fill: "url('#referral')",
            },
            '& .MuiAreaElement-series-direct': {
              fill: "url('#direct')",
            },
          }}
        >
          <AreaGradient color={theme.palette.primary.dark} id="organic" />
          <AreaGradient color={theme.palette.primary.main} id="referral" />
          <AreaGradient color={theme.palette.primary.light} id="direct" />
        </LineChart>
      </CardContent>
    </Card>
  );
}