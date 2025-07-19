import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import background from "../assets/images/finish.gif"; // Background image - matching main congratulations
import bgMusic from "../assets/audio/celebrate.mp3"; // Background music file

// Styled Components - matching Congratulation.jsx
const PixelBox = styled(Box)(({ theme }) => ({
  height: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: `url(${background})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  fontFamily: '"Press Start 2P", cursive',
  position: "relative",
  padding: "20px",
  boxSizing: "border-box",
}));

// Forest-themed title styling - matching Congratulation.jsx
const CongratulationsTitle = styled(Typography)({
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "80px",
  color: "#a7c957", // Forest green
  textShadow: `
    4px 4px 0 #2d5016,
    8px 8px 0 #1a3409,
    0 0 20px #7fb069,
    0 0 40px #4a7c59,
    0 0 60px rgba(127, 176, 105, 0.8)
  `,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "8px",
  lineHeight: "1.2",
  marginBottom: "40px",
  animation: "congratsPulse 3s infinite ease-in-out",
  WebkitTextStroke: "2px #2d5016",
  textStroke: "2px #2d5016",
  "@keyframes congratsPulse": {
    "0%, 100%": {
      textShadow: `
        4px 4px 0 #2d5016,
        8px 8px 0 #1a3409,
        0 0 20px #7fb069,
        0 0 40px #4a7c59,
        0 0 60px rgba(127, 176, 105, 0.8)
      `,
      transform: "scale(1)",
      filter: "brightness(1)",
    },
    "50%": {
      textShadow: `
        6px 6px 0 #2d5016,
        12px 12px 0 #1a3409,
        0 0 30px #a7c957,
        0 0 60px #7fb069,
        0 0 90px rgba(167, 201, 87, 1)
      `,
      transform: "scale(1.05)",
      filter: "brightness(1.2)",
    },
  },
  // Responsive sizing
  "@media (max-width: 1200px)": {
    fontSize: "60px",
    letterSpacing: "6px",
  },
  "@media (max-width: 768px)": {
    fontSize: "40px",
    letterSpacing: "4px",
    marginBottom: "30px",
  },
  "@media (max-width: 480px)": {
    fontSize: "28px",
    letterSpacing: "2px",
    marginBottom: "20px",
  },
});

// Play again question styling - matching Congratulation.jsx
const PlayAgainQuestion = styled(Typography)({
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "24px",
  color: "#ffffff",
  textShadow: `
    2px 2px 0 #2d5016,
    0 0 10px rgba(167, 201, 87, 0.8),
    0 0 20px rgba(127, 176, 105, 0.6)
  `,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "2px",
  marginBottom: "30px",
  backgroundColor: "rgba(45, 80, 22, 0.8)",
  padding: "20px 30px",
  border: "3px solid #a7c957",
  borderRadius: "15px",
  boxShadow: `
    0 0 20px rgba(167, 201, 87, 0.5),
    0 8px 16px rgba(0, 0, 0, 0.6)
  `,
  backdropFilter: "blur(5px)",
  // Responsive sizing
  "@media (max-width: 768px)": {
    fontSize: "18px",
    letterSpacing: "1px",
    padding: "15px 20px",
  },
  "@media (max-width: 480px)": {
    fontSize: "14px",
    letterSpacing: "1px",
    padding: "12px 16px",
  },
});

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "30px",
  marginTop: "20px",
  // Responsive layout
  "@media (max-width: 768px)": {
    gap: "20px",
    flexDirection: "column",
  },
}));

// Forest-themed buttons to match other components
const PixelButton = styled(Box)(({ theme }) => ({
  display: "inline-block",
  backgroundColor: "#2d5016", // Dark forest green
  color: "#ffffff",
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "18px",
  padding: "20px 50px",
  border: "3px solid #7fb069", // Forest green border
  borderRadius: "12px",
  boxShadow: `
    0 0 15px rgba(127, 176, 105, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.6),
    inset 0 2px 0 rgba(255, 255, 255, 0.1)
  `,
  cursor: "pointer",
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "2px",
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
    borderRadius: "9px",
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
    transform: "translateY(-3px) scale(1.05)",
    "&::before": {
      opacity: 1,
    },
  },
  "&:active": {
    transform: "translateY(-1px) scale(1.02)",
  },
  // Responsive sizing
  "@media (max-width: 768px)": {
    fontSize: "16px",
    padding: "18px 40px",
  },
  "@media (max-width: 480px)": {
    fontSize: "14px",
    padding: "15px 30px",
    width: "200px",
  },
}));

// Main content container
const ContentContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  zIndex: 10,
});

const Congteasy = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [bgVolume, setBgVolume] = useState(
    parseInt(localStorage.getItem("bgVolume"), 10) || 0
  );

  // Audio setup
  useEffect(() => {
    // Initialize audio object
    audioRef.current = new Audio(bgMusic);
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = bgVolume / 100;

    const handleClick = () => {
      audio.play().catch((error) =>
        console.error("Background music playback failed:", error)
      );
      document.removeEventListener("click", handleClick);
    };

    document.addEventListener("click", handleClick);

    return () => {
      // Cleanup
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener("click", handleClick);
    };
  }, [bgVolume]);

  // Listen to volume changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newVolume = parseInt(localStorage.getItem("bgVolume"), 10) || 0;
      setBgVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume / 100;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Ensure the game was completed before showing congratulations
  useEffect(() => {
    const gameCompleted = localStorage.getItem("gameCompleted");
    if (!gameCompleted || gameCompleted !== "true") {
      navigate("/Play");
    }
  }, [navigate]);

  // Handlers for navigation buttons
  const handlePlayAgain = () => {
    localStorage.removeItem("gameCompleted"); // Clear completion status
    navigate("/easy");
  };

  const handleExit = () => {
    localStorage.removeItem("gameCompleted");
    navigate("/play");
  };

  return (
    <PixelBox>
      <ContentContainer>
        {/* Main Congratulations Title */}
        <CongratulationsTitle variant="h1">
          Congratulations!
        </CongratulationsTitle>

        {/* Play Again Question */}
        <PlayAgainQuestion variant="h3">
          Would you like to play again?
        </PlayAgainQuestion>

        {/* Action Buttons */}
        <ButtonContainer>
          <PixelButton onClick={handlePlayAgain}>
            Yes, Play Again!
          </PixelButton>
          <PixelButton onClick={handleExit}>
            No, Exit Game
          </PixelButton>
        </ButtonContainer>
      </ContentContainer>
    </PixelBox>
  );
};

export default Congteasy;
