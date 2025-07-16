import { useState, useEffect, useMemo } from 'react';


// Mock game data - you can replace this with API calls later
const MOCK_GAMES = [
  {
    // use this as to connect in to the memory card game
    id: 1,
    title: 'Forest Card Game',
    description: 'Test your memory with forest-themed cards and learn about nature conservation',
    fullDescription: 'Challenge your memory skills with our Forest Card Game! Match pairs of forest-themed cards while learning about different aspects of nature conservation. Choose from three difficulty levels: Easy (2 pairs), Normal (3 pairs), and Hard (6 pairs). Each successful match teaches you about forest ecosystems and wildlife.',
    genre: 'Memory & Strategy',
    status: 'available',
    progress: 75,
    difficulty: 'Beginner',
    duration: '15-30 min',
    ageRange: '6-16 years',
    image: '/games/memory-card-game.jpg',
    banner: '/games/memory-card-banner.jpg',
    features: [
      'Multiple difficulty levels',
      'Forest conservation education',
      'Memory skill development',
      'Interactive sound effects',
      'Progress tracking',
      'Calm mode option'
    ],
    route: 'http://localhost:5177', // This will be used as the external URL
    isExternal: true // Flag to indicate this is an external game
  },
  {
    id: 2,
    title: 'Carbon Calculator',
    description: 'Learn how forests capture carbon and calculate environmental impact',
    fullDescription: 'Dive deep into the science of carbon sequestration! Use real-world data to understand how forests capture CO2 and contribute to fighting climate change. Build your own carbon calculation models.',
    genre: 'Educational',
    status: 'available',
    progress: 100,
    difficulty: 'Intermediate',
    duration: '30 min',
    ageRange: '10-16 years',
    image: '/games/carbon-calculator.jpg',
    banner: '/games/carbon-calculator-banner.jpg',
    features: [
      'Real scientific data',
      'Interactive calculations',
      'Visual carbon modeling',
      'Progress tracking'
    ],
    route: '/calculator'
  },
  {
    id: 3,
    title: 'Ecosystem Builder',
    description: 'Create and maintain balanced forest ecosystems',
    fullDescription: 'Become an ecosystem architect! Design balanced forest environments by understanding species relationships, food chains, and habitat requirements. Watch your ecosystem thrive or struggle based on your decisions.',
    genre: 'Simulation',
    status: 'coming-soon',
    progress: 0,
    difficulty: 'Advanced',
    duration: '60 min',
    ageRange: '12-18 years',
    image: '/games/ecosystem-builder.jpg',
    banner: '/games/ecosystem-builder-banner.jpg',
    features: [
      'Complex ecosystem simulation',
      'Species interaction modeling',
      'Biodiversity challenges',
      'Research-based gameplay'
    ],
    route: '/game/ecosystem-builder'
  },
  {
    id: 4,
    title: 'Wildlife Rescue',
    description: 'Save endangered animals and learn about conservation',
    fullDescription: 'Join the wildlife rescue team! Learn about endangered species, their habitats, and conservation efforts. Complete rescue missions and contribute to real-world conservation knowledge.',
    genre: 'Adventure',
    status: 'locked',
    progress: 0,
    difficulty: 'Beginner',
    duration: '40 min',
    ageRange: '6-12 years',
    image: '/games/wildlife-rescue.jpg',
    banner: '/games/wildlife-rescue-banner.jpg',
    features: [
      'Endangered species education',
      'Rescue mission gameplay',
      'Conservation awareness',
      'Mini-game collection'
    ],
    route: '/game/wildlife-rescue'
  },
  {
    id: 5,
    title: 'Climate Champions',
    description: 'Battle climate change with forest solutions',
    fullDescription: 'Unite as Climate Champions! Learn how forests combat climate change through this action-packed educational adventure. Make decisions that impact global environmental health.',
    genre: 'Action-RPG',
    status: 'coming-soon',
    progress: 0,
    difficulty: 'Intermediate',
    duration: '50 min',
    ageRange: '10-16 years',
    image: '/games/climate-champions.jpg',
    banner: '/games/climate-champions-banner.jpg',
    features: [
      'Climate science education',
      'Action-based learning',
      'Global impact simulation',
      'Multiplayer cooperation'
    ],
    route: '/game/climate-champions'
  },
  {
    id: 6,
    title: 'Tree Planting Simulator',
    description: 'Experience reforestation from seed to forest',
    fullDescription: 'Follow the complete journey of reforestation! Plant seeds, nurture saplings, and watch forests grow over time. Learn about different tree species and their environmental benefits.',
    genre: 'Simulation',
    status: 'available',
    progress: 25,
    difficulty: 'Beginner',
    duration: '35 min',
    ageRange: '6-14 years',
    image: '/games/tree-planting.jpg',
    banner: '/games/tree-planting-banner.jpg',
    features: [
      'Realistic growth simulation',
      'Species variety education',
      'Time-based progression',
      'Environmental impact tracking'
    ],
    route: '/game/tree-planting'
  }
];

export const useGameLibrary = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading games (replace with actual API call)
  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGames(MOCK_GAMES);
      setIsLoading(false);
    };

    loadGames();
  }, []);

  // Modal management effects - handles escape key and body scroll
  useEffect(() => {
    if (!selectedGame) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedGame(null);
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleEscape);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedGame]);

  // Filter and search games
  const filteredGames = useMemo(() => {
    let filtered = games;

    // Apply status filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'completed') {
        filtered = filtered.filter(game => game.progress === 100);
      } else {
        filtered = filtered.filter(game => game.status === selectedFilter);
      }
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchLower) ||
        game.description.toLowerCase().includes(searchLower) ||
        game.genre.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [games, searchTerm, selectedFilter]);

  // Game selection handler
  const handleGameSelect = (game) => {
    setSelectedGame(selectedGame?.id === game.id ? null : game);
  };

  // Enhanced game play handler for external games
  const handlePlayGame = (game) => {
    console.log('Playing game:', game.title);
    
    // Handle external games (like memory card game)
    if (game.isExternal && game.route) {
      console.log('Opening external game:', game.route);
      
      // Open external game in new tab/window
      const gameWindow = window.open(
        game.route, 
        '_blank', // Opens in new tab
        'noopener,noreferrer' // Security features
      );
      
      // Check if popup was blocked
      if (!gameWindow) {
        alert('Please allow popups for this site to play external games!');
        return null;
      }
      
      // Focus the new tab
      gameWindow.focus();
      
      // Return null to indicate no internal navigation needed
      return null;
    }
    
    // Handle internal games with routing
    return game.route;
  };

  // Close modal handler
  const handleCloseModal = () => {
    setSelectedGame(null);
  };

  // Backdrop click handler for modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedGame(null);
    }
  };

  // Progress update handler
  const updateGameProgress = (gameId, newProgress) => {
    setGames(prevGames => 
      prevGames.map(game => 
        game.id === gameId 
          ? { ...game, progress: newProgress }
          : game
      )
    );
  };

  return {
    // Game data
    games: filteredGames,
    selectedGame,
    isLoading,
    
    // Search and filter
    searchTerm,
    selectedFilter,
    setSearchTerm,
    setSelectedFilter,
    
    // Game interactions
    handleGameSelect,
    handlePlayGame,
    updateGameProgress,
    
    // Modal management
    handleCloseModal,
    handleBackdropClick,
    setSelectedGame
  };
};