import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../hooks/useAudio.hook';
import { useCalculator } from '../../hooks/calculator.hook';
import { 
  TransportationSection, 
  EnergySection, 
  WasteSection, 
  LifestyleSection,
  CalculatorForm,
  ResultsDisplay
} from '../../components/carbon.component';

const CarbonCalculatorScreen = () => {
  const navigate = useNavigate();
  const { playSound } = useAudio();
  
  const {
    formData,
    totalFootprint,
    showResults,
    tips,
    footprintCategory,
    handleCalculate,
    handleReset,
    handleInputChange
  } = useCalculator(() => playSound());

  const handleBack = () => {
    playSound();
    navigate('/menu');
  };

  return (
    <div className="carbon-calculator">
      <div className="calculator-header">
        <h2 className="pixel-text">🌍 Carbon Footprint Calculator</h2>
        <p>Calculate your environmental impact and learn how to reduce it!</p>
      </div>

      {!showResults ? (
        <CalculatorForm
          formData={formData}
          onInputChange={handleInputChange}
          onCalculate={handleCalculate}
          onReset={handleReset}
        />
      ) : (
        <ResultsDisplay
          totalFootprint={totalFootprint}
          footprintCategory={footprintCategory}
          tips={tips}
          onReset={handleReset}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default CarbonCalculatorScreen;