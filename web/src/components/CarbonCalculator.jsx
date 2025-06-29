import React, { useState, useEffect } from 'react';
import './CarbonCalculator.css';
import { 
  calculateCarbonFootprint, 
  getFootprintCategory, 
  generateTips, 
  BENCHMARKS,
  formatNumber 
} from '../utils/carbonUtils';

const CarbonCalculator = ({ onBack, playSound }) => {
  const [formData, setFormData] = useState({
    // Transportation
    carMiles: 0,
    publicTransit: 0,
    flights: 0,
    
    // Energy
    electricity: 0,
    naturalGas: 0,
    heatingOil: 0,
    
    // Waste
    waste: 0,
    recycling: 0,
    
    // Lifestyle
    meatConsumption: 'moderate',
    localFood: 'moderate',
    clothing: 'moderate'
  });

  const [totalFootprint, setTotalFootprint] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [tips, setTips] = useState([]);

  const handleCalculate = () => {
    playSound && playSound();
    const footprint = calculateCarbonFootprint(formData);
    setTotalFootprint(footprint);
    setTips(generateTips(formData, footprint));
    setShowResults(true);
  };

  const handleReset = () => {
    playSound && playSound();
    setFormData({
      carMiles: 0,
      publicTransit: 0,
      flights: 0,
      electricity: 0,
      naturalGas: 0,
      heatingOil: 0,
      waste: 0,
      recycling: 0,
      meatConsumption: 'moderate',
      localFood: 'moderate',
      clothing: 'moderate'
    });
    setShowResults(false);
    setTotalFootprint(0);
    setTips([]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const footprintCategory = getFootprintCategory(totalFootprint);

  return (
    <div className="carbon-calculator">
      <div className="calculator-header">
        <h2 className="pixel-text">🌍 Carbon Footprint Calculator</h2>
        <p>Calculate your environmental impact and learn how to reduce it!</p>
      </div>

      {!showResults ? (
        <div className="calculator-form">
          <div className="form-section">
            <h3>🚗 Transportation</h3>
            <div className="input-group">
              <label>Car miles per year:</label>
              <input
                type="number"
                value={formData.carMiles}
                onChange={(e) => handleInputChange('carMiles', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label>Public transit miles per year:</label>
              <input
                type="number"
                value={formData.publicTransit}
                onChange={(e) => handleInputChange('publicTransit', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label>Flight hours per year:</label>
              <input
                type="number"
                value={formData.flights}
                onChange={(e) => handleInputChange('flights', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>⚡ Energy Usage</h3>
            <div className="input-group">
              <label>Electricity (kWh per year):</label>
              <input
                type="number"
                value={formData.electricity}
                onChange={(e) => handleInputChange('electricity', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label>Natural Gas (therms per year):</label>
              <input
                type="number"
                value={formData.naturalGas}
                onChange={(e) => handleInputChange('naturalGas', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label>Heating Oil (gallons per year):</label>
              <input
                type="number"
                value={formData.heatingOil}
                onChange={(e) => handleInputChange('heatingOil', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>♻️ Waste & Recycling</h3>
            <div className="input-group">
              <label>Waste (pounds per year):</label>
              <input
                type="number"
                value={formData.waste}
                onChange={(e) => handleInputChange('waste', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="input-group">
              <label>Recycling (pounds per year):</label>
              <input
                type="number"
                value={formData.recycling}
                onChange={(e) => handleInputChange('recycling', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>🥗 Lifestyle Choices</h3>
            <div className="input-group">
              <label>Meat Consumption:</label>
              <select
                value={formData.meatConsumption}
                onChange={(e) => handleInputChange('meatConsumption', e.target.value)}
              >
                <option value="low">Low (Vegetarian/Vegan)</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="input-group">
              <label>Local Food Consumption:</label>
              <select
                value={formData.localFood}
                onChange={(e) => handleInputChange('localFood', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High (Mostly Local)</option>
              </select>
            </div>
            <div className="input-group">
              <label>Clothing Habits:</label>
              <select
                value={formData.clothing}
                onChange={(e) => handleInputChange('clothing', e.target.value)}
              >
                <option value="low">Low (Second-hand/Sustainable)</option>
                <option value="moderate">Moderate</option>
                <option value="high">High (Fast Fashion)</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="pixel-button" onClick={handleCalculate}>
              Calculate Footprint
            </button>
            <button className="pixel-button secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div className="calculator-results">
          <div className="results-header">
            <h3>Your Carbon Footprint Results</h3>
          </div>
          
          <div className="footprint-display">
            <div className="footprint-number" style={{ color: footprintCategory.color }}>
              {formatNumber(totalFootprint)} tons CO₂/year
            </div>
            <div className="footprint-level" style={{ color: footprintCategory.color }}>
              {footprintCategory.emoji} {footprintCategory.label} Impact
            </div>
          </div>

          <div className="comparison">
            <p>Average US household: ~{BENCHMARKS.US_AVERAGE} tons CO₂/year</p>
            <p>Global average: ~{BENCHMARKS.GLOBAL_AVERAGE} tons CO₂/year</p>
            <p>Global target for sustainability: ~{BENCHMARKS.SUSTAINABLE_TARGET} tons CO₂/year</p>
          </div>

          <div className="tips-section">
            <h4>💡 Tips to Reduce Your Footprint:</h4>
            <ul className="tips-list">
              {tips.map((tip, index) => (
                <li key={index}>
                  <div className="tip-content">{tip.tip}</div>
                  <div className="tip-impact">{tip.impact}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="results-actions">
            <button className="pixel-button" onClick={handleReset}>
              Calculate Again
            </button>
            <button className="pixel-button secondary" onClick={onBack}>
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonCalculator; 