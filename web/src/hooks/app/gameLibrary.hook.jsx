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
    image: '/image/memorycard.jpg',
    banner: '/image/forest.png',
    features: [
      'Multiple difficulty levels',
      'Forest conservation education',
      'Memory skill development',
      'Interactive sound effects',
      'Progress tracking',
      'Calm mode option'
    ],
    route: 'http://localhost:5177', // Memory card game port
    isExternal: true // Flag to indicate this is an external game
  },
  {
    // use this to connect the wonder puzz game
    id: 2,
    title: 'Forest Puzzle Game',
    description: 'Solve forest-themed jigsaw puzzles and learn about wildlife conservation',
    fullDescription: 'Challenge your problem-solving skills with our Forest Puzzle Game! Complete beautiful jigsaw puzzles featuring forest wildlife and landscapes. Choose from three difficulty levels: Easy (2x2), Medium (3x3), and Hard (4x2). Each completed puzzle teaches you about forest ecosystems and wildlife conservation.',
    genre: 'Puzzle & Educational',
    status: 'available',
    progress: 100,
    difficulty: 'Intermediate',
    duration: '20-45 min',
    ageRange: '8-16 years',
    image: '/games/forest-puzzle-game.jpg',
    banner: '/games/forest-puzzle-banner.jpg',
    features: [
      'Multiple difficulty levels',
      'Beautiful forest imagery',
      'Wildlife education',
      'Timer challenges',
      'Progress tracking',
      'Relaxing gameplay'
    ],
    route: 'http://localhost:5176', // Puzzle game port
    isExternal: true // Flag to indicate this is an external game
  },
  {
    // use this for the matching card game
    id: 3,
    title: 'Forest Match Game',
    description: 'Test your knowledge by matching forest animals and their sounds',
    fullDescription: 'Challenge your wildlife knowledge with our Forest Match Game! Listen to animal sounds and match them with the correct forest animals. Learn about different species, their habitats, and the sounds they make in the wild. Perfect for developing auditory recognition skills while learning about forest ecosystems.',
    genre: 'Educational & Audio',
    status: 'available',
    progress: 50,
    difficulty: 'Intermediate',
    duration: '15-25 min',
    ageRange: '8-16 years',
    image: '/games/forest-match-game.jpg',
    banner: '/games/forest-match-banner.jpg',
    features: [
      'Audio-based learning',
      'Animal sound recognition',
      'Wildlife education',
      'Multiple difficulty levels',
      'Progress tracking',
      'Interactive gameplay'
    ],
    route: 'http://localhost:5175', // Match game port
    isExternal: true // Flag to indicate this is an external game
  },
  {
    // use this for the color game
    id: 4,
    title: 'Forest Color Game',
    description: 'Learn about forest wildlife through interactive coloring and educational activities',
    fullDescription: 'Discover the vibrant world of forest wildlife with our interactive coloring game! Color beautiful forest animals and plants while learning about their characteristics, habitats, and conservation status. Each coloring session includes fun facts and educational content about forest ecosystems.',
    genre: 'Creative & Educational',
    status: 'available',
    progress: 25,
    difficulty: 'Beginner',
    duration: '20-35 min',
    ageRange: '6-14 years',
    image: '/games/forest-color-game.jpg',
    banner: '/games/forest-color-banner.jpg',
    features: [
      'Interactive coloring',
      'Wildlife education',
      'Creative expression',
      'Fun facts learning',
      'Progress saving',
      'Relaxing gameplay'
    ],
    route: 'http://localhost:5174', // Color game port
    isExternal: true // Flag to indicate this is an external game
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
    
    // Handle external games (memory card, puzzle, match, and color games)
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