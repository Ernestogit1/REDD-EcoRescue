// Carbon footprint calculation constants and utilities

// Transportation emission factors (kg CO2 per unit)
export const TRANSPORT_EMISSIONS = {
  CAR: 0.404, // kg CO2 per mile (average car)
  PUBLIC_TRANSIT: 0.14, // kg CO2 per mile (bus/train)
  FLIGHT: 0.255, // kg CO2 per hour (domestic flight)
  ELECTRIC_CAR: 0.1, // kg CO2 per mile (if charged with renewable energy)
  BICYCLE: 0, // kg CO2 per mile (no emissions)
  WALKING: 0 // kg CO2 per mile (no emissions)
};

// Energy emission factors
export const ENERGY_EMISSIONS = {
  ELECTRICITY: 0.92, // kg CO2 per kWh (US average)
  NATURAL_GAS: 0.054, // kg CO2 per therm
  HEATING_OIL: 22.61, // kg CO2 per gallon
  PROPANE: 12.43, // kg CO2 per gallon
  SOLAR: 0, // kg CO2 per kWh (no emissions during use)
  WIND: 0 // kg CO2 per kWh (no emissions during use)
};

// Waste emission factors
export const WASTE_EMISSIONS = {
  LANDFILL: 0.5, // kg CO2 per pound of waste
  RECYCLING_REDUCTION: 0.25, // kg CO2 reduction per pound recycled
  COMPOSTING_REDUCTION: 0.3 // kg CO2 reduction per pound composted
};

// Lifestyle multipliers
export const LIFESTYLE_MULTIPLIERS = {
  MEAT_CONSUMPTION: {
    low: 0.7, // Vegetarian/vegan
    moderate: 1.0, // Average meat consumption
    high: 1.4 // High meat consumption
  },
  LOCAL_FOOD: {
    low: 1.2, // Imported food
    moderate: 1.0, // Mixed local/imported
    high: 0.8 // Mostly local food
  },
  CLOTHING: {
    low: 0.8, // Second-hand/sustainable
    moderate: 1.0, // Average consumption
    high: 1.3 // Fast fashion
  }
};

// Carbon footprint categories and their typical ranges
export const FOOTPRINT_CATEGORIES = {
  VERY_LOW: { min: 0, max: 5, label: 'Very Low', color: '#4CAF50', emoji: '🌱' },
  LOW: { min: 5, max: 10, label: 'Low', color: '#8BC34A', emoji: '🌿' },
  MODERATE: { min: 10, max: 20, label: 'Moderate', color: '#FF9800', emoji: '🌳' },
  HIGH: { min: 20, max: 30, label: 'High', color: '#F44336', emoji: '🌍' },
  VERY_HIGH: { min: 30, max: Infinity, label: 'Very High', color: '#9C27B0', emoji: '🔥' }
};

// Comparison benchmarks
export const BENCHMARKS = {
  US_AVERAGE: 16.5, // tons CO2 per person per year
  GLOBAL_AVERAGE: 4.8, // tons CO2 per person per year
  SUSTAINABLE_TARGET: 2.0, // tons CO2 per person per year (Paris Agreement target)
  CARBON_NEUTRAL: 0 // tons CO2 per person per year
};

// Calculate carbon footprint based on input data
export const calculateCarbonFootprint = (data) => {
  let total = 0;
  
  // Transportation calculations
  total += (data.carMiles * TRANSPORT_EMISSIONS.CAR) / 1000;
  total += (data.publicTransit * TRANSPORT_EMISSIONS.PUBLIC_TRANSIT) / 1000;
  total += (data.flights * TRANSPORT_EMISSIONS.FLIGHT) / 1000;
  
  // Energy calculations
  total += (data.electricity * ENERGY_EMISSIONS.ELECTRICITY) / 1000;
  total += (data.naturalGas * ENERGY_EMISSIONS.NATURAL_GAS) / 1000;
  total += (data.heatingOil * ENERGY_EMISSIONS.HEATING_OIL) / 1000;
  
  // Waste calculations
  total += (data.waste * WASTE_EMISSIONS.LANDFILL) / 1000;
  total -= (data.recycling * WASTE_EMISSIONS.RECYCLING_REDUCTION) / 1000;
  
  // Apply lifestyle multipliers
  total *= LIFESTYLE_MULTIPLIERS.MEAT_CONSUMPTION[data.meatConsumption] || 1.0;
  total *= LIFESTYLE_MULTIPLIERS.LOCAL_FOOD[data.localFood] || 1.0;
  total *= LIFESTYLE_MULTIPLIERS.CLOTHING[data.clothing] || 1.0;
  
  return Math.max(0, total);
};

// Get footprint category based on total emissions
export const getFootprintCategory = (footprint) => {
  for (const [key, category] of Object.entries(FOOTPRINT_CATEGORIES)) {
    if (footprint >= category.min && footprint < category.max) {
      return category;
    }
  }
  return FOOTPRINT_CATEGORIES.VERY_HIGH;
};

// Generate personalized tips based on user data
export const generateTips = (data, footprint) => {
  const tips = [];
  
  // Transportation tips
  if (data.carMiles > 10000) {
    tips.push({
      category: 'Transportation',
      tip: '🚗 Consider carpooling or using public transportation to reduce your car emissions',
      impact: 'Can reduce emissions by 2-4 tons CO2/year'
    });
  }
  
  if (data.flights > 5) {
    tips.push({
      category: 'Transportation',
      tip: '✈️ Consider video conferencing instead of flying for business meetings',
      impact: 'Each avoided flight saves ~0.5 tons CO2'
    });
  }
  
  // Energy tips
  if (data.electricity > 10000) {
    tips.push({
      category: 'Energy',
      tip: '💡 Switch to LED bulbs and unplug electronics when not in use',
      impact: 'Can reduce electricity use by 10-20%'
    });
  }
  
  if (data.electricity > 15000) {
    tips.push({
      category: 'Energy',
      tip: '☀️ Consider installing solar panels or switching to renewable energy',
      impact: 'Can reduce emissions by 3-5 tons CO2/year'
    });
  }
  
  // Lifestyle tips
  if (data.meatConsumption === 'high') {
    tips.push({
      category: 'Lifestyle',
      tip: '🥗 Try meatless Mondays or reduce meat consumption to lower your carbon footprint',
      impact: 'Can reduce emissions by 1-2 tons CO2/year'
    });
  }
  
  if (data.waste > 1000) {
    tips.push({
      category: 'Waste',
      tip: '♻️ Compost food waste and recycle more to reduce landfill emissions',
      impact: 'Can reduce emissions by 0.5-1 ton CO2/year'
    });
  }
  
  // General tips based on footprint level
  if (footprint > BENCHMARKS.US_AVERAGE) {
    tips.push({
      category: 'General',
      tip: '🌱 Your footprint is above average. Consider renewable energy options for your home',
      impact: 'Can significantly reduce your overall footprint'
    });
  }
  
  if (footprint < 10) {
    tips.push({
      category: 'General',
      tip: '🌍 Great job! Your carbon footprint is already quite low. Keep up the good work!',
      impact: 'You\'re setting a great example for others'
    });
  }
  
  return tips;
};

// Convert units for better user experience
export const convertUnits = {
  milesToKm: (miles) => miles * 1.60934,
  kmToMiles: (km) => km / 1.60934,
  poundsToKg: (pounds) => pounds * 0.453592,
  kgToPounds: (kg) => kg / 0.453592,
  gallonsToLiters: (gallons) => gallons * 3.78541,
  litersToGallons: (liters) => liters / 3.78541
};

// Format numbers for display
export const formatNumber = (number, decimals = 1) => {
  return Number(number).toFixed(decimals);
};

// Calculate percentage difference from benchmark
export const getBenchmarkComparison = (footprint, benchmark = BENCHMARKS.US_AVERAGE) => {
  const difference = ((footprint - benchmark) / benchmark) * 100;
  return {
    difference: Math.abs(difference),
    isAbove: footprint > benchmark,
    percentage: formatNumber(difference, 1)
  };
}; 