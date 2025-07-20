import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Box, Paper, Typography, Grid, Card, CardContent } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#3B82F6',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#3B82F6',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12
    }
  }
};

// Default empty chart data
const defaultData = {
  labels: ['No Data'],
  datasets: [{
    data: [0],
    backgroundColor: ['#E5E7EB'],
    borderWidth: 0
  }]
};

export const UserRegistrationChart = ({ data }) => {
  const chartData = data && data.labels && data.datasets ? data : {
    labels: ['No Data Available'],
    datasets: [{
      label: 'New Users',
      data: [0],
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F620',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <Card sx={{ height: '100%', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          User Registrations (Last 30 Days)
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      </CardContent>
    </Card>
  );
};

export const GamePopularityChart = ({ data }) => {
  const chartData = data && data.labels && data.datasets ? data : defaultData;

  return (
    <Card sx={{ height: '100%', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          Game Popularity
        </Typography>
        <Box sx={{ height: 300 }}>
          <Doughnut data={chartData} options={doughnutOptions} />
        </Box>
      </CardContent>
    </Card>
  );
};

export const RankDistributionChart = ({ data }) => {
  const chartData = data && data.labels && data.datasets ? data : defaultData;

  return (
    <Card sx={{ height: '100%', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          User Rank Distribution
        </Typography>
        <Box sx={{ height: 300 }}>
          <Pie data={chartData} options={doughnutOptions} />
        </Box>
      </CardContent>
    </Card>
  );
};

export const DifficultyPerformanceChart = ({ data }) => {
  const chartData = data && data.labels && data.datasets ? data : {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [{
      label: 'No Data',
      data: [0, 0, 0],
      backgroundColor: '#E5E7EB',
      borderRadius: 8
    }]
  };

  return (
    <Card sx={{ height: '100%', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          Games by Difficulty Level
        </Typography>
        <Box sx={{ height: 300 }}>
          <Bar 
            data={chartData} 
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                x: {
                  ...chartOptions.scales.x,
                  stacked: false
                },
                y: {
                  ...chartOptions.scales.y,
                  stacked: false
                }
              }
            }} 
          />
        </Box>
      </CardContent>
    </Card>
  );
};