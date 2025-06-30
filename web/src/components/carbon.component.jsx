import React from 'react';
import { BENCHMARKS, formatNumber } from '../utils/carbonUtils';

// Form Section Components
export const TransportationSection = ({ formData, onInputChange }) => (
  <div className="form-section">
    <h3>🚗 Transportation</h3>
    <div className="input-group">
      <label>Car miles per year:</label>
      <input
        type="number"
        value={formData.carMiles}
        onChange={(e) => onInputChange('carMiles', parseFloat(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
    <div className="input-group">
      <label>Public transit miles per year:</label>
      <input
        type="number"
        value={formData.publicTransit}
        onChange={(e) => onInputChange('publicTransit', parseFloat(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
    <div className="input-group">
      <label>Flight hours per year:</label>
      <input
        type="number"
        value={formData.flights}
        onChange={(e) => onInputChange('flights', parseFloat(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
  </div>
);

export const EnergySection = ({ formData, onInputChange }) => (
  <div className="form-section">
    <h3>⚡ Energy Usage</h3>
    <div className="input-group">
      <label>Electricity (kWh per year):</label>
      <input
        type="number"
        value={formData.electricity}
        onChange={(e) => onInputChange('electricity', parseFloat(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
    <div className="input-group">
      <label>Natural Gas (therms per year):</label>
      <input
        type="number"
        value={formData.naturalGas}
        onChange={(e) => onInputChange('naturalGas', parseFloat(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
    <div className="input-group">
      <label>Heating Oil (gallons per year):</label>
      <input
        type="number"
        value={formData.heatingOil}
        onChange={(e) => onInputChange('heatingOil', parseFloat(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
  </div>
);

export const WasteSection = ({ formData, onInputChange }) => (
  <div className="form-section">
    <h3>♻️ Waste & Recycling</h3>
    <div className="input-group">
      <label>Waste (pounds per year):</label>
      <input
        type="number"
        value={formData.waste}
        onChange={(e) => onInputChange('waste', parseFloat(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
    <div className="input-group">
      <label>Recycling (pounds per year):</label>
      <input
        type="number"
        value={formData.recycling}
        onChange={(e) => onInputChange('recycling', parseFloat(e.target.value) || 0)}
        placeholder="0"
      />
    </div>
  </div>
);

export const LifestyleSection = ({ formData, onInputChange }) => (
  <div className="form-section">
    <h3>🥗 Lifestyle Choices</h3>
    <div className="input-group">
      <label>Meat Consumption:</label>
      <select
        value={formData.meatConsumption}
        onChange={(e) => onInputChange('meatConsumption', e.target.value)}
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
        onChange={(e) => onInputChange('localFood', e.target.value)}
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
        onChange={(e) => onInputChange('clothing', e.target.value)}
      >
        <option value="low">Low (Second-hand/Sustainable)</option>
        <option value="moderate">Moderate</option>
        <option value="high">High (Fast Fashion)</option>
      </select>
    </div>
  </div>
);

export const CalculatorForm = ({ formData, onInputChange, onCalculate, onReset }) => (
  <div className="calculator-form">
    <TransportationSection formData={formData} onInputChange={onInputChange} />
    <EnergySection formData={formData} onInputChange={onInputChange} />
    <WasteSection formData={formData} onInputChange={onInputChange} />
    <LifestyleSection formData={formData} onInputChange={onInputChange} />
    
    <div className="form-actions">
      <button className="pixel-button" onClick={onCalculate}>
        Calculate Footprint
      </button>
      <button className="pixel-button secondary" onClick={onReset}>
        Reset
      </button>
    </div>
  </div>
);

export const ResultsDisplay = ({ 
  totalFootprint, 
  footprintCategory, 
  tips, 
  onReset, 
  onBack 
}) => (
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
      <button className="pixel-button" onClick={onReset}>
        Calculate Again
      </button>
      <button className="pixel-button secondary" onClick={onBack}>
        Back to Menu
      </button>
    </div>
  </div>
);

