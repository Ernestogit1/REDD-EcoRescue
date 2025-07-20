import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, IconButton, Slider, Modal } from "@mui/material";
import { motion } from "framer-motion";
import { JigsawPuzzle } from "react-jigsaw-puzzle";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SettingsIcon from "@mui/icons-material/Settings";
import backgroundMusic from "../assets/audio/calm-play.mp3";

import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";
import backgroundImage from "../assets/images/swamp.png";
import sharkImage from "../assets/images/1.png";
import turtleImage from "../assets/images/2.png";
import salamanderImage from "../assets/images/3.png";
import fishImage from "../assets/images/4.png";

// Remove scrollbars globally
document.body.style.overflow = "hidden";
document.documentElement.style.overflow = "hidden";

const images = [sharkImage, turtleImage, salamanderImage, fishImage];

const Hard = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);
  const [scatter, setScatter] = useState(false);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openBackModal, setOpenBackModal] = useState(false);
  const gameSavedRef = useRef(false);

  const [openSettings, setOpenSettings] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  const navigate = useNavigate();

  const sendGameData = async (isCompleted) => {
    if (gameSavedRef.current) return;
    gameSavedRef.current = true;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/puz",
        {
          timeSpent: time,
          difficulty: "hard",
          isCompleted,
          playedAt: new Date().toISOString(),
        },
        { withCredentials: true }
      );

      if (response.status === 201) {
        console.log("Game session saved successfully");
      } else {
        console.error("Failed to save game session");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUserInteraction = () => {
    if (!isAudioPlaying && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play()
        .then(() => setIsAudioPlaying(true))
        .catch((error) => console.error("Autoplay blocked:", error));
    }
  };

  const startNewGame = () => {
    setIsSolved(false);
    setShowOriginal(true);
    setScatter(false);
    setTime(0);
    setRunning(false);
    gameSavedRef.current = false;
    const newImage = images[Math.floor(Math.random() * images.length)];
    setSelectedImage(newImage);

    setTimeout(() => {
      setShowOriginal(false);
      setTimeout(() => setRunning(true), 1500);
    }, 2000);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    let interval;
    if (running && !isSolved) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running, isSolved]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  if (!selectedImage) return null;

  return (
    <>
      <audio ref={audioRef} src={backgroundMusic} loop />
      
      {/* Floating Swamp Particles - More intense for Hard mode */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
            style={{
              position: "absolute",
              top: `${10 + i * 7}%`,
              left: `${5 + i * 8}%`,
              width: "10px",
              height: "10px",
              backgroundColor: "#f44336",
              borderRadius: "50%",
              boxShadow: "0 0 15px rgba(244, 67, 54, 0.8)",
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          backgroundImage: `linear-gradient(rgba(40, 10, 10, 0.4), rgba(50, 20, 20, 0.6)), url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          overflow: "hidden",
        }}
        onClick={handleUserInteraction}
      >
        {/* Swamp-themed Back Button - Red theme for Hard */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setOpenBackModal(true)}
            sx={{
              position: "absolute",
              top: "20px",
              left: "20px",
              background: "linear-gradient(135deg, #d32f2f, #f44336)",
              color: "#ffebee",
              fontSize: "16px",
              fontWeight: "bold",
              padding: "12px 24px",
              borderRadius: "25px",
              border: "2px solid rgba(244, 67, 54, 0.4)",
              boxShadow: "0 4px 15px rgba(211, 47, 47, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              "&:hover": { 
                background: "linear-gradient(135deg, #b71c1c, #d32f2f)",
                boxShadow: "0 6px 20px rgba(211, 47, 47, 0.5)",
              },
            }}
          >
            🔥 ← Back to Swamp
          </Button>
        </motion.div>

        {/* Swamp-themed Settings Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
            <IconButton
          onClick={() => setOpenSettings(true)}
          sx={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "linear-gradient(135deg, rgba(211, 47, 47, 0.8), rgba(244, 67, 54, 0.6))",
            color: "#ffebee",
            padding: "15px",
            borderRadius: "50%",
            border: "2px solid rgba(244, 67, 54, 0.5)",
            boxShadow: "0 4px 15px rgba(211, 47, 47, 0.4)",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease-in-out",
            "&:hover": { 
              background: "linear-gradient(135deg, rgba(183, 28, 28, 0.9), rgba(211, 47, 47, 0.8))",
              boxShadow: "0 6px 20px rgba(211, 47, 47, 0.6)",
              transform: "scale(1.1)",
            },
          }}
        >
          <SettingsIcon fontSize="large" />
        </IconButton>
        </motion.div>

        {/* Swamp-themed Timer */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Box
            sx={{
              position: "absolute",
              bottom: "100px",
              right: "30px",
              background: "linear-gradient(135deg, rgba(211, 47, 47, 0.9), rgba(244, 67, 54, 0.7))",
              color: "#ffebee",
              fontSize: "20px",
              fontWeight: "bold",
              padding: "15px 25px",
              borderRadius: "20px",
              border: "2px solid rgba(244, 67, 54, 0.5)",
              boxShadow: "0 4px 15px rgba(211, 47, 47, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "120px",
            }}
          >
            🕐 {formatTime(time)}
          </Box>
        </motion.div>

        {/* Swamp-themed New Game Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
         <Button
          onClick={startNewGame}
          variant="contained"
          sx={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            background: "linear-gradient(135deg, #ff5722, #ff7043)",
            color: "#ffebee",
            fontSize: "16px",
            fontWeight: "bold",
            padding: "12px 24px",
            borderRadius: "20px",
            border: "2px solid rgba(255, 87, 34, 0.5)",
            boxShadow: "0 4px 15px rgba(255, 87, 34, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.3)",
            transition: "all 0.3s ease-in-out",
            "&:hover": { 
              background: "linear-gradient(135deg, #e64a19, #ff5722)",
              boxShadow: "0 6px 20px rgba(255, 87, 34, 0.6)",
              transform: "scale(1.05)",
            },
          }}
        >
          🔥 New Challenge
        </Button>
        </motion.div>

        {/* Swamp-themed Reference Image */}
        <motion.div
          animate={{ 
            boxShadow: [
              "0 4px 15px rgba(244, 67, 54, 0.4)",
              "0 6px 25px rgba(244, 67, 54, 0.6)",
              "0 4px 15px rgba(244, 67, 54, 0.4)",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "60px",
              right: "20px",
              width: "160px",
              height: "160px",
              background: "linear-gradient(135deg, rgba(211, 47, 47, 0.9), rgba(244, 67, 54, 0.7))",
              padding: "10px",
              borderRadius: "20px",
              border: "3px solid rgba(244, 67, 54, 0.6)",
              boxShadow: "0 4px 15px rgba(211, 47, 47, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={selectedImage}
              alt="Reference Image"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "15px",
                border: "2px solid rgba(255, 235, 238, 0.3)",
              }}
            />
          </Box>
        </motion.div>

        {/* Custom Swamp-themed Puzzle Board for Hard */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "520px",
              height: "520px",
              background: `
                radial-gradient(circle at 30% 20%, rgba(244, 67, 54, 0.2) 0%, transparent 40%),
                radial-gradient(circle at 70% 80%, rgba(255, 87, 34, 0.2) 0%, transparent 40%),
                linear-gradient(135deg, rgba(211, 47, 47, 0.3), rgba(183, 28, 28, 0.5))
              `,
              borderRadius: "25px",
              border: "4px solid rgba(244, 67, 54, 0.6)",
              boxShadow: `
                0 8px 32px rgba(211, 47, 47, 0.4),
                inset 0 2px 4px rgba(255, 255, 255, 0.1),
                inset 0 -2px 4px rgba(0, 0, 0, 0.1)
              `,
              backdropFilter: "blur(15px)",
              padding: "40px",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "10px",
                left: "10px",
                right: "10px",
                bottom: "10px",
                borderRadius: "20px",
                border: "1px solid rgba(244, 67, 54, 0.3)",
                pointerEvents: "none",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: "5px",
                left: "5px",
                right: "5px",
                bottom: "5px",
                borderRadius: "22px",
                background: "linear-gradient(45deg, transparent, rgba(244, 67, 54, 0.1), transparent)",
                pointerEvents: "none",
              },
            }}
          >
            {/* Puzzle Area with Custom Styling */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                borderRadius: "15px",
                background: "linear-gradient(135deg, rgba(255, 235, 238, 0.1), rgba(255, 205, 210, 0.2))",
                border: "2px dashed rgba(244, 67, 54, 0.4)",
                boxShadow: "inset 0 2px 8px rgba(211, 47, 47, 0.2)",
                overflow: "hidden",
              }}
            >
              {/* Show Original Image First */}
              {showOriginal && (
                <motion.img
                  src={selectedImage}
                  alt="Pre-Show Image"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "13px",
                  }}
                />
              )}

              {/* Jigsaw Puzzle with Custom Styling - 4x2 for Hard mode */}
              {!showOriginal && (
                <motion.div
                  initial={{ opacity: 0, scale: 1.5 }}
                  animate={scatter ? { opacity: 0 } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <JigsawPuzzle
                    imageSrc={selectedImage}
                    rows={4}
                    columns={2}
                    onSolved={() => {
                      if (!gameSavedRef.current) {
                        setIsSolved(true);
                        setScatter(true);
                        setRunning(false);
                        sendGameData(1);
                        setTimeout(() => setOpenModal(true), 1000);
                      }
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "none",
                      outline: "none",
                      borderRadius: "13px",
                      overflow: "hidden",
                    }}
                  />
                </motion.div>
              )}

              {/* Enhanced Scatter Effect for 8 pieces */}
              {scatter &&
                [...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                    animate={{
                      opacity: 0,
                      x: i % 2 === 0 ? 400 : -400,
                      y: i < 4 ? -400 : 400,
                      rotate: 360 + i * 45,
                      scale: 0.5,
                    }}
                    transition={{ duration: 2, ease: "easeInOut", delay: i * 0.1 }}
                    style={{
                      position: "absolute",
                      width: "50%",
                      height: "25%",
                      backgroundImage: `url(${selectedImage})`,
                      backgroundSize: "200% 400%",
                      backgroundPosition: `${i % 2 === 0 ? '0' : '100%'} ${i < 2 ? '0' : i < 4 ? '33.33%' : i < 6 ? '66.66%' : '100%'}%`,
                      borderRadius: "10px",
                      boxShadow: "0 4px 15px rgba(211, 47, 47, 0.3)",
                      left: i % 2 === 0 ? '0' : '50%',
                      top: i < 2 ? '0' : i < 4 ? '25%' : i < 6 ? '50%' : '75%',
                    }}
                  />
                ))}

              {/* Completed Image with Celebration Effect */}
              {isSolved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    boxShadow: [
                      "0 0 20px rgba(244, 67, 54, 0.6)",
                      "0 0 40px rgba(255, 87, 34, 0.8)",
                      "0 0 20px rgba(244, 67, 54, 0.6)",
                    ]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    ease: "easeInOut",
                    boxShadow: { duration: 2, repeat: Infinity }
                  }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: "13px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={selectedImage}
                    alt="Completed Puzzle"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "13px",
                    }}
                  />
                </motion.div>
              )}
            </Box>
          </Box>
        </motion.div>

        {/* Swamp-themed Settings Modal */}
        <Modal open={openSettings} onClose={() => setOpenSettings(false)}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "350px",
                background: "linear-gradient(135deg, rgba(211, 47, 47, 0.95), rgba(244, 67, 54, 0.9))",
                padding: "30px",
                borderRadius: "20px",
                border: "3px solid rgba(244, 67, 54, 0.6)",
                boxShadow: "0 8px 32px rgba(211, 47, 47, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(15px)",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{ 
                  fontSize: "24px", 
                  fontWeight: "bold", 
                  color: "#ffebee",
                  marginBottom: "25px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                🔥 Hardcore Swamp Settings
              </Typography>

              <Box sx={{ width: "100%", marginTop: "20px" }}>
                <Typography
                  sx={{ 
                    fontSize: "16px", 
                    fontWeight: "bold", 
                    color: "#ffebee",
                    marginBottom: "15px",
                  }}
                >
                  🔊 Volume Control
                </Typography>
                <Slider
                  value={volume}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(event, newVolume) => {
                    setVolume(newVolume);
                    if (audioRef.current) {
                      audioRef.current.volume = newVolume;
                    }
                  }}
                  sx={{ 
                    color: "#ff5722",
                    "& .MuiSlider-thumb": {
                      backgroundColor: "#f44336",
                      border: "3px solid #ffebee",
                      boxShadow: "0 0 10px rgba(244, 67, 54, 0.6)",
                      width: 24,
                      height: 24,
                    },
                    "& .MuiSlider-track": {
                      backgroundColor: "#ff5722",
                      height: 6,
                      boxShadow: "0 0 8px rgba(255, 87, 34, 0.4)",
                    },
                    "& .MuiSlider-rail": {
                      backgroundColor: "rgba(255, 235, 238, 0.3)",
                      height: 6,
                    },
                  }}
                />
              </Box>
            </Box>
          </motion.div>
        </Modal>

        {/* Swamp-themed Success Modal */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "450px",
                background: "linear-gradient(135deg, rgba(211, 47, 47, 0.95), rgba(244, 67, 54, 0.9))",
                padding: "35px",
                borderRadius: "25px",
                border: "4px solid rgba(255, 87, 34, 0.8)",
                boxShadow: "0 12px 40px rgba(211, 47, 47, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(20px)",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{ 
                  fontSize: "28px", 
                  fontWeight: "bold", 
                  color: "#ffebee", 
                  marginBottom: "20px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                🎉 Hardcore Swamp Conquered! 🔥
              </Typography>
              
              <Typography
                sx={{ 
                  fontSize: "16px", 
                  color: "#ffcdd2", 
                  marginBottom: "25px",
                }}
              >
                You've mastered the most dangerous swamplands with ultimate skill!
              </Typography>

              <Box sx={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                <Button
                  onClick={() => {
                    window.location.reload();
                  }}
                  sx={{
                    background: "linear-gradient(135deg, #ff5722, #ff7043)",
                    color: "#ffebee",
                    fontSize: "16px",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    borderRadius: "15px",
                    border: "2px solid rgba(255, 87, 34, 0.5)",
                    boxShadow: "0 4px 15px rgba(255, 87, 34, 0.4)",
                    "&:hover": { 
                      background: "linear-gradient(135deg, #e64a19, #ff5722)",
                      boxShadow: "0 6px 20px rgba(255, 87, 34, 0.6)",
                    },
                  }}
                >
                  🔥 New Challenge
                </Button>

                <Button
                  onClick={() => navigate("/")}
                  sx={{
                    background: "linear-gradient(135deg, #9c27b0, #e91e63)",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    borderRadius: "15px",
                    border: "2px solid rgba(156, 39, 176, 0.5)",
                    boxShadow: "0 4px 15px rgba(156, 39, 176, 0.4)",
                    "&:hover": { 
                      background: "linear-gradient(135deg, #7b1fa2, #c2185b)",
                      boxShadow: "0 6px 20px rgba(156, 39, 176, 0.6)",
                    },
                  }}
                >
                  🏠 Return Home
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Modal>

        {/* Swamp-themed Back Confirmation Modal */}
        <Modal open={openBackModal} onClose={() => setOpenBackModal(false)}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "400px",
                background: "linear-gradient(135deg, rgba(211, 47, 47, 0.95), rgba(244, 67, 54, 0.9))",
                padding: "30px",
                borderRadius: "20px",
                border: "3px solid rgba(244, 67, 54, 0.6)",
                boxShadow: "0 8px 32px rgba(211, 47, 47, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(15px)",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{ 
                  fontSize: "22px", 
                  fontWeight: "bold", 
                  color: "#ffebee", 
                  marginBottom: "20px",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                🔥 Flee the Hardcore Swamplands?
              </Typography>

              <Box sx={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                <Button
                  onClick={() => {
                    sendGameData(0);
                    setTimeout(() => navigate("/"), 500);
                  }}
                  sx={{
                    background: "linear-gradient(135deg, #ff5722, #ff7043)",
                    color: "#ffebee",
                    fontSize: "16px",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    borderRadius: "15px",
                    border: "2px solid rgba(255, 87, 34, 0.5)",
                    "&:hover": { 
                      background: "linear-gradient(135deg, #e64a19, #ff5722)",
                    },
                  }}
                >
                  ✅ Yes
                </Button>

                <Button
                  onClick={() => setOpenBackModal(false)}
                  sx={{
                    background: "linear-gradient(135deg, #9c27b0, #e91e63)",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    borderRadius: "15px",
                    border: "2px solid rgba(156, 39, 176, 0.5)",
                    "&:hover": { 
                      background: "linear-gradient(135deg, #7b1fa2, #c2185b)",
                    },
                  }}
                >
                  ❌ No
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Modal>
      </Box>
    </>
  );
};

export default Hard;