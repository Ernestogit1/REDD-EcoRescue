import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Button, Modal, Typography } from "@mui/material";
import { styled } from "@mui/system";
import PropTypes from "prop-types";
import { useSpring, animated } from "@react-spring/web";
import background from "../assets/images/animalPLay.gif"; // Changed to match main game
import bgMusic from "../assets/audio/lost.mp3";
import useCardStore from '../store/cardStore';

const defaultDifficulty = "Easy";

// Card Images - 2x2 (4 cards total)
const cardImages = [
  { id: 1, image: "/images/leopard.jpg" },
  { id: 2, image: "/images/leopard.jpg" },
  { id: 3, image: "/images/blackBear.jpg" },
  { id: 4, image: "/images/blackBear.jpg" },
];

// Audio files for matching and final congratulation
const matchAudioFiles = [
  "/audio/wonderful.mp3",
  "/audio/NiceJob.mp3",
];

const congratsAudio = "/audio/congrats.mp3";

// Shuffle Logic
const shuffleArray = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

// FIXED: Main container with proper responsive layout - matching MemoryCardGame.jsx
const StyledGameContainer = styled(Box)(({ mouseDisabled }) => ({
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  backgroundImage: `url(${background})`,
  backgroundSize: "cover",
  backgroundPosition: "center center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  position: "relative",
  overflow: "auto",
  pointerEvents: mouseDisabled ? "none" : "auto",
  margin: 0,
  padding: "20px",
  boxSizing: "border-box",
}));

// Header container
const HeaderContainer = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 20px",
  position: "relative",
  zIndex: 10,
});

// Stats container
const StatsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  alignItems: "flex-start",
});

// 8-bit Forest Theme Buttons - matching MemoryCardGame.jsx
const PixelButton = styled(Box)({
  display: "inline-block",
  backgroundColor: "#2d5016",
  color: "#ffffff",
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "14px",
  padding: "15px 30px",
  border: "3px solid #7fb069",
  borderRadius: "8px",
  boxShadow: `
    0 0 15px rgba(127, 176, 105, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.6),
    inset 0 2px 0 rgba(255, 255, 255, 0.1)
  `,
  cursor: "pointer",
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "1px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, transparent, rgba(167, 201, 87, 0.1), transparent)",
    borderRadius: "5px",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    backgroundColor: "#4a7c59",
    borderColor: "#a7c957",
    boxShadow: `
      0 0 25px rgba(167, 201, 87, 0.6),
      0 12px 24px rgba(0, 0, 0, 0.7),
      inset 0 2px 0 rgba(255, 255, 255, 0.2)
    `,
    transform: "translateY(-2px) scale(1.02)",
    "&::before": {
      opacity: 1,
    },
  },
  "&:active": {
    transform: "translateY(0) scale(0.98)",
  },
});

// Info boxes - matching MemoryCardGame.jsx
const PixelBox = styled(Box)({
  backgroundColor: "rgba(74, 124, 89, 0.95)",
  color: "#ffffff",
  padding: "12px 24px",
  border: "3px solid #a7c957",
  borderRadius: "10px",
  boxShadow: `
    0 0 20px rgba(167, 201, 87, 0.5),
    0 8px 16px rgba(0, 0, 0, 0.6)
  `,
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "12px",
  textAlign: "center",
  textShadow: "2px 2px 0 #2d5016",
  backdropFilter: "blur(5px)",
  minWidth: "150px",
});

const PixelTimerBox = styled(Box)({
  backgroundColor: "rgba(45, 80, 22, 0.95)",
  color: "#ffffff",
  padding: "12px 24px",
  border: "3px solid #7fb069",
  borderRadius: "10px",
  boxShadow: `
    0 0 20px rgba(127, 176, 105, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.6)
  `,
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "12px",
  textAlign: "center",
  textShadow: "2px 2px 0 #1a3409",
  backdropFilter: "blur(5px)",
  minWidth: "150px",
});

// Game content container
const GameContentContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px 0",
});

// Enhanced Card Components - matching MemoryCardGame.jsx
const CardContainer = styled(Box)({
  perspective: "1000px",
  cursor: "pointer",
  width: "160px", // Slightly larger for Easy mode
  height: "160px",
  margin: "8px",
  filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))",
});

const CardInner = styled(animated.div)({
  position: "relative",
  width: "100%",
  height: "100%",
  transformStyle: "preserve-3d",
  transition: "transform 0.6s",
});

const CardFront = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #4a7c59, #2d5016)",
  border: "4px solid #a7c957",
  borderRadius: "12px",
  transform: "rotateY(180deg)",
  boxShadow: `
    0 0 20px rgba(167, 201, 87, 0.6),
    0 8px 16px rgba(0, 0, 0, 0.7),
    inset 0 2px 0 rgba(255, 255, 255, 0.1)
  `,
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-2px",
    left: "-2px",
    right: "-2px",
    bottom: "-2px",
    background: "linear-gradient(45deg, #7fb069, #a7c957, #d4e09b, #7fb069)",
    borderRadius: "14px",
    zIndex: -1,
    filter: "blur(1px)",
  },
});

const CardBack = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #2d5016, #4a7c59, #1a3409)",
  border: "4px solid #7fb069",
  borderRadius: "12px",
  transform: "rotateY(0deg)",
  boxShadow: `
    0 0 15px rgba(127, 176, 105, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.6),
    inset 0 2px 0 rgba(255, 255, 255, 0.05)
  `,
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-2px",
    left: "-2px",
    right: "-2px",
    bottom: "-2px",
    background: "linear-gradient(45deg, #4a7c59, #7fb069, #5d8a3a, #4a7c59)",
    borderRadius: "14px",
    zIndex: -1,
    filter: "blur(1px)",
  },
});

// Forest-themed Modal - matching MemoryCardGame.jsx
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'linear-gradient(135deg, rgba(45, 80, 22, 0.95), rgba(74, 124, 89, 0.95))',
  border: '3px solid #a7c957',
  boxShadow: `
    0 0 30px rgba(167, 201, 87, 0.6),
    0 16px 32px rgba(0, 0, 0, 0.8)
  `,
  padding: '30px',
  textAlign: 'center',
  borderRadius: '15px',
  backdropFilter: 'blur(10px)',
  minWidth: '400px',
};

const PixelTypography = styled(Typography)({
  fontFamily: '"Press Start 2P", cursive',
  fontSize: '16px',
  color: '#ffffff',
  letterSpacing: '1px',
  lineHeight: '1.5',
  textShadow: `
    2px 2px 0 #2d5016,
    0 0 10px rgba(167, 201, 87, 0.8)
  `,
  marginBottom: '20px',
});

const PixelButtonModal = styled(Button)({
  backgroundColor: "#2d5016",
  color: "#ffffff",
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "12px",
  padding: "12px 24px",
  border: "3px solid #7fb069",
  borderRadius: "8px",
  boxShadow: `
    0 0 15px rgba(127, 176, 105, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.6)
  `,
  cursor: "pointer",
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "1px",
  margin: "0 8px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: "#4a7c59",
    borderColor: "#a7c957",
    boxShadow: `
      0 0 25px rgba(167, 201, 87, 0.6),
      0 12px 24px rgba(0, 0, 0, 0.7)
    `,
    transform: "translateY(-2px) scale(1.05)",
  },
  "&:active": {
    transform: "translateY(0) scale(0.98)",
  },
});

// Card Component - matching MemoryCardGame.jsx
const Card = ({ card, handleClick, flipped, matched }) => {
  const { transform } = useSpring({
    transform: flipped || matched ? "rotateY(180deg)" : "rotateY(0deg)",
    config: { tension: 500, friction: 30 },
  });

  return (
    <CardContainer onClick={handleClick}>
      <CardInner style={{ transform }}>
        <CardFront>
          <img 
            src={card.image} 
            alt="Card front" 
            style={{ 
              width: "120%", 
              height: "120%", 
              objectFit: "cover",
              borderRadius: "8px",
              filter: "contrast(1.1) saturate(1.2)",
            }} 
          />
        </CardFront>
        <CardBack>
          <img 
            src="/images/backshot.jpg" 
            alt="Card back" 
            style={{ 
              width: "120%", 
              height: "120%", 
              objectFit: "cover",
              borderRadius: "8px",
              filter: "sepia(0.3) hue-rotate(90deg) saturate(1.4)",
            }} 
          />
        </CardBack>
      </CardInner>
    </CardContainer>
  );
};

Card.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  handleClick: PropTypes.func.isRequired,
  flipped: PropTypes.bool.isRequired,
  matched: PropTypes.bool.isRequired,
};

const MemoryEasy = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [initialReveal, setInitialReveal] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);
  const [mouseDisabled, setMouseDisabled] = useState(false);
  const [bgVolume] = useState(parseInt(localStorage.getItem("bgVolume"), 10) || 0);
  const [sfxVolume] = useState(parseInt(localStorage.getItem("sfxVolume"), 10) || 0);
  const audioRef = useRef(null);
  const [audioIndex, setAudioIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const saveGameData = useCardStore(state => state.saveGameData);

  const handleSaveNewGame = () => {
    const gameData = {
      gameDate: new Date(),
      failed: failedAttempts,
      difficulty: defaultDifficulty,
      completed: 0,
      timeTaken: timer,
    };
    console.log("Starting new game with previous stats:", gameData);
  };

  const handleNewGame = () => {  
    setCards(shuffleArray(cardImages));
    setMatchedCards([]);
    setFlippedCards([]);
    setFailedAttempts(0);
    setTimer(0);
    setTimerActive(false);
    setInitialReveal(true);
    setAudioIndex(0);
    
    const mouseDisableDuration = 2000;
    setMouseDisabled(true);
    setTimeout(() => {
      setMouseDisabled(false);
    }, mouseDisableDuration);

    setTimeout(() => {
      setInitialReveal(false);
      setTimerActive(true);
    }, 1500);
  };

  const handleBackButton = () => {
    setOpenModal(true);
  };

  const handleModalYes = () => {
    setOpenModal(false);
    localStorage.removeItem("gameCompleted");
    navigate("/play");
  };

  const handleModalNo = () => {
    setOpenModal(false);
  };
   
  useEffect(() => {
    handleNewGame();
    const handleFirstClick = () => {
      if (!musicStarted && audioRef.current) {
        audioRef.current.volume = bgVolume / 100;
        audioRef.current.play().catch((error) => console.error("Audio play error:", error));
        setMusicStarted(true);
      }
    };
    document.addEventListener("click", handleFirstClick);

    return () => document.removeEventListener("click", handleFirstClick);
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards;
      setTimeout(() => {
        if (card1.image === card2.image) {
          setMatchedCards((prev) => [...prev, card1.id, card2.id]);
          if (audioIndex < matchAudioFiles.length) {
            const nextAudio = new Audio(matchAudioFiles[audioIndex]);
            nextAudio.volume = sfxVolume / 100;
            nextAudio.play();
            setAudioIndex(audioIndex + 1);
          }
        } else {
          setFailedAttempts((prev) => prev + 1);
        }
        setFlippedCards([]);
      }, 1000);
    }
  }, [flippedCards, audioIndex, sfxVolume]);
  
  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
        const congrats = new Audio(congratsAudio);
        congrats.volume = sfxVolume / 100;
        congrats.play();

        setTimerActive(false);

        const saveData = async () => {
            try {
                await saveGameData({
                    gameDate: new Date(),
                    failed: failedAttempts,
                    difficulty: defaultDifficulty,
                    completed: 1,  
                    timeTaken: timer,
                });
                localStorage.setItem("gameCompleted", "true");
                setTimeout(() => navigate("/congt-easy"), 1000);
            } catch (error) {
                console.error("Error saving game data:", error);
            }
        };

        saveData();
    }
}, [matchedCards, cards.length, navigate, sfxVolume, failedAttempts, timer, saveGameData]);

  const handleCardClick = (card) => {
    if (!matchedCards.includes(card.id) && flippedCards.length < 2 && !flippedCards.some((c) => c.id === card.id)) {
      setFlippedCards((prev) => [...prev, card]);
    }
  };

  return (
    <StyledGameContainer mouseDisabled={mouseDisabled}>
      <audio ref={audioRef} src={bgMusic} loop />
      
      <HeaderContainer>
        <PixelButton 
          onClick={handleBackButton}
          sx={{ alignSelf: "flex-start" }}
        >
          Back
        </PixelButton>
        
        <StatsContainer>
          <PixelTimerBox>Timer: {timer}s</PixelTimerBox>
          <PixelBox>Failed Attempts: {failedAttempts}</PixelBox>
        </StatsContainer>
      </HeaderContainer>

      <GameContentContainer>
        {/* 2x2 Grid for Easy Mode */}
        <Grid 
          container 
          spacing={3} 
          justifyContent="center" 
          sx={{ 
            maxWidth: 400, 
            margin: "20px auto",
            padding: "30px",
            background: "rgba(45, 80, 22, 0.9)",
            borderRadius: "20px",
            border: "3px solid #a7c957",
            backdropFilter: "blur(10px)",
            boxShadow: `
              0 0 30px rgba(167, 201, 87, 0.6),
              0 16px 32px rgba(0, 0, 0, 0.8),
              inset 0 2px 0 rgba(255, 255, 255, 0.1)
            `,
          }}
        >
          {cards.map((card) => (
            <Grid item xs={6} key={card.id}> {/* 2x2 grid */}
              <Card
                card={card}
                handleClick={() => handleCardClick(card)}
                flipped={
                  initialReveal ||
                  flippedCards.some((c) => c.id === card.id) ||
                  matchedCards.includes(card.id)
                }
                matched={matchedCards.includes(card.id)}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ 
          textAlign: "center", 
          marginTop: "20px",
          marginBottom: "20px" 
        }}>
          <PixelButton onClick={() => { handleSaveNewGame(); handleNewGame(); }}>
            New Game
          </PixelButton>
        </Box>
      </GameContentContainer>

      <Modal open={openModal} onClose={handleModalNo}>
        <Box sx={modalStyle}>
          <PixelTypography variant="h6">
            Are you sure you want to go back to the play page?
          </PixelTypography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
            <PixelButtonModal onClick={() => { handleSaveNewGame(); handleModalYes(); }} variant="contained">
              Yes
            </PixelButtonModal>
            <PixelButtonModal onClick={handleModalNo} variant="contained">
              No
            </PixelButtonModal>
          </Box>
        </Box>
      </Modal>
    </StyledGameContainer>
  );
};

export default MemoryEasy;