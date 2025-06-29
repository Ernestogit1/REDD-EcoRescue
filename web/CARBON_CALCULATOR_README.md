# Carbon Calculator Feature

## Overview

The Carbon Calculator is an interactive tool integrated into the REDD-EcoRescue web application that helps users calculate their personal carbon footprint and provides personalized recommendations for reducing their environmental impact.

## Features

### 🧮 Comprehensive Calculations
- **Transportation**: Car miles, public transit, and flight emissions
- **Energy Usage**: Electricity, natural gas, and heating oil consumption
- **Waste Management**: Landfill waste and recycling impact
- **Lifestyle Choices**: Meat consumption, local food, and clothing habits

### 📊 Detailed Results
- **Carbon Footprint**: Calculated in tons of CO₂ per year
- **Impact Level**: Categorized as Very Low, Low, Moderate, High, or Very High
- **Benchmark Comparisons**: Compare against US average, global average, and sustainability targets
- **Personalized Tips**: Actionable recommendations based on your specific data

### 🎨 User Experience
- **Pixel Art Design**: Matches the game's aesthetic
- **Responsive Layout**: Works on desktop and mobile devices
- **Interactive Forms**: Real-time input validation and feedback
- **Sound Effects**: Audio feedback for button interactions

## How to Use

### 1. Access the Calculator
- Launch the REDD-EcoRescue web application
- Click "CARBON CALCULATOR" from the main menu

### 2. Enter Your Data
Fill in the following sections:

#### Transportation
- **Car miles per year**: Your annual driving distance
- **Public transit miles per year**: Distance traveled by bus/train
- **Flight hours per year**: Total time spent flying

#### Energy Usage
- **Electricity (kWh per year)**: Your annual electricity consumption
- **Natural Gas (therms per year)**: Annual natural gas usage
- **Heating Oil (gallons per year)**: Annual heating oil consumption

#### Waste & Recycling
- **Waste (pounds per year)**: Annual waste sent to landfill
- **Recycling (pounds per year)**: Annual materials recycled

#### Lifestyle Choices
- **Meat Consumption**: Low (Vegetarian/Vegan), Moderate, or High
- **Local Food**: Low, Moderate, or High (Mostly Local)
- **Clothing**: Low (Second-hand/Sustainable), Moderate, or High (Fast Fashion)

### 3. Calculate Results
- Click "Calculate Footprint" to see your results
- Review your carbon footprint and impact level
- Read personalized tips for reducing your footprint

### 4. Take Action
- Implement the suggested changes
- Recalculate periodically to track your progress
- Share your results to inspire others

## Calculation Methodology

### Emission Factors
The calculator uses scientifically-based emission factors:

- **Transportation**:
  - Car: 0.404 kg CO₂ per mile
  - Public Transit: 0.14 kg CO₂ per mile
  - Flights: 0.255 kg CO₂ per hour

- **Energy**:
  - Electricity: 0.92 kg CO₂ per kWh
  - Natural Gas: 0.054 kg CO₂ per therm
  - Heating Oil: 22.61 kg CO₂ per gallon

- **Waste**:
  - Landfill: 0.5 kg CO₂ per pound
  - Recycling Reduction: 0.25 kg CO₂ per pound

### Lifestyle Multipliers
- **Meat Consumption**: Low (0.7x), Moderate (1.0x), High (1.4x)
- **Local Food**: Low (1.2x), Moderate (1.0x), High (0.8x)
- **Clothing**: Low (0.8x), Moderate (1.0x), High (1.3x)

## Impact Categories

| Category | Range (tons CO₂/year) | Color | Emoji |
|----------|----------------------|-------|-------|
| Very Low | 0-5 | Green | 🌱 |
| Low | 5-10 | Light Green | 🌿 |
| Moderate | 10-20 | Orange | 🌳 |
| High | 20-30 | Red | 🌍 |
| Very High | 30+ | Purple | 🔥 |

## Benchmarks

- **US Average**: 16.5 tons CO₂/year per person
- **Global Average**: 4.8 tons CO₂/year per person
- **Sustainability Target**: 2.0 tons CO₂/year per person (Paris Agreement)

## Tips Categories

The calculator provides personalized tips in these areas:

### 🚗 Transportation
- Carpooling and public transit options
- Flight reduction strategies
- Electric vehicle considerations

### ⚡ Energy
- Energy efficiency improvements
- Renewable energy options
- Smart home technologies

### ♻️ Waste
- Recycling and composting
- Waste reduction strategies
- Circular economy practices

### 🥗 Lifestyle
- Dietary changes
- Local food sourcing
- Sustainable fashion choices

## Technical Implementation

### Files Structure
```
web/src/
├── components/
│   ├── CarbonCalculator.jsx
│   └── CarbonCalculator.css
├── utils/
│   └── carbonUtils.js
└── App.jsx (updated)
```

### Key Components
- **CarbonCalculator.jsx**: Main component with form and results display
- **CarbonCalculator.css**: Styling matching the game's pixel art theme
- **carbonUtils.js**: Calculation logic and utility functions

### Dependencies
- React (for component structure)
- CSS (for styling)
- No external libraries required

## Future Enhancements

### Planned Features
- **Data Persistence**: Save and track footprint over time
- **Goal Setting**: Set reduction targets and track progress
- **Social Features**: Share results and compete with friends
- **Advanced Calculations**: More detailed categories and factors
- **Offline Mode**: Work without internet connection

### Potential Integrations
- **Smart Home APIs**: Automatic energy data import
- **Transportation Apps**: Mileage tracking integration
- **Carbon Offset**: Purchase offsets directly from the app
- **Educational Content**: Learn more about climate change

## Contributing

To contribute to the carbon calculator:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Add comments for complex calculations
- Include unit tests for new features
- Update documentation as needed

## Resources

### Scientific References
- EPA Emission Factors for Greenhouse Gas Inventories
- IPCC Guidelines for National Greenhouse Gas Inventories
- Carbon Trust Footprint Calculation Methodology

### Educational Resources
- [EPA Carbon Footprint Calculator](https://www3.epa.gov/carbon-footprint-calculator/)
- [Carbon Trust](https://www.carbontrust.com/)
- [WWF Footprint Calculator](https://footprint.wwf.org.uk/)

## Support

For questions or issues with the carbon calculator:
- Check the main README.md file
- Review the code comments
- Open an issue on the repository

---

*This carbon calculator is designed to be educational and raise awareness about personal environmental impact. While it provides estimates based on scientific data, individual results may vary based on specific circumstances.* 