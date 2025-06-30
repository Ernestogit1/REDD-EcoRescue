import { useState } from 'react';
import { 
  calculateCarbonFootprint, 
  getFootprintCategory,
  generateTips 
} from '../utils/carbonUtils';

const INITIAL_FORM_DATA = {
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
};

export const useCalculator = (playSound) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [totalFootprint, setTotalFootprint] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [tips, setTips] = useState([]);

  const handleCalculate = () => {
    playSound?.();
    const footprint = calculateCarbonFootprint(formData);
    setTotalFootprint(footprint);
    setTips(generateTips(formData, footprint));
    setShowResults(true);
  };

  const handleReset = () => {
    playSound?.();
    setFormData(INITIAL_FORM_DATA);
    setShowResults(false);
    setTotalFootprint(0);
    setTips([]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const footprintCategory = getFootprintCategory(totalFootprint);

  return {
    formData,
    totalFootprint,
    showResults,
    tips,
    footprintCategory,
    handleCalculate,
    handleReset,
    handleInputChange
  };
};