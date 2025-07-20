import React, { useState, useEffect, useRef } from "react";
import { Box, Modal, Slider, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SettingsIcon from "@mui/icons-material/Settings";
import backgroundImage from "../assets/images/puzzlebg.png"; // Your swamp background
import easyImage from "../assets/images/easy.png";
import mediumImage from "../assets/images/medium.png";
import hardImage from "../assets/images/hard.png";
import backgroundMusic from "../assets/audio/bg-forest.mp3";
import "@fontsource/press-start-2p";

const Home = () => {
  const navigate = useNavigate();
  const [openSettings, setOpenSettings] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleUserInteraction = () => {
    if (!isAudioPlaying && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play()
        .then(() => setIsAudioPlaying(true))
        .catch((error) => console.error("Autoplay blocked:", error));
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `linear-gradient(rgba(0, 50, 0, 0.4), rgba(20, 40, 20, 0.6)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={handleUserInteraction}
    >
      {/* Background Music */}
      <audio ref={audioRef} src={backgroundMusic} loop />

      {/* Floating Fog/Mist Effect */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(100, 150, 100, 0.2) 70%)",
          animation: "mistFloat 8s ease-in-out infinite alternate",
          "@keyframes mistFloat": {
            "0%": { transform: "translateX(-20px) translateY(10px)" },
            "100%": { transform: "translateX(20px) translateY(-10px)" },
          },
        }}
      />

      {/* Swamp-themed Game Title */}
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{
          y: [0, -15, 0],
          opacity: 1,
          textShadow: [
            "0px 0px 15px rgba(76, 175, 80, 0.8), 0px 0px 30px rgba(139, 195, 74, 0.6)",
            "0px 0px 25px rgba(76, 175, 80, 1), 0px 0px 40px rgba(139, 195, 74, 0.8)",
            "0px 0px 15px rgba(76, 175, 80, 0.8), 0px 0px 30px rgba(139, 195, 74, 0.6)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{
          fontSize: "90px",
          fontWeight: "bold",
          color: "#a5d6a7",
          fontFamily: "'Press Start 2P', sans-serif",
          letterSpacing: "6px",
          transform: "skewX(-8deg)",
          filter: "brightness(1.1)",
          textShadow: "0px 0px 20px rgba(76, 175, 80, 0.9)",
          marginBottom: "40px",
        }}
      >
        SwampQuest
      </motion.div>

      {/* Floating Subtitle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.7, 1, 0.7],
          y: [0, -5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          fontSize: "16px",
          color: "#c8e6c9",
          fontFamily: "'Press Start 2P', sans-serif",
          marginBottom: "60px",
          textShadow: "0px 0px 10px rgba(76, 175, 80, 0.7)",
        }}
      >
        ~ Navigate the Mystic Swamplands ~
      </motion.div>

      {/* Difficulty Selection with Floating Animation */}
      <Box
        sx={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          perspective: "1000px",
        }}
      >
        {/* Easy Button */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ 
            y: [0, -20, 0],
            rotateY: [0, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0,
          }}
          whileHover={{
            scale: 1.1,
            rotateY: 10,
            z: 50,
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            cursor: "pointer",
            filter: "drop-shadow(0px 0px 20px rgba(76, 175, 80, 0.8))",
          }}
          onClick={() => navigate("/Jigsaw")}
        >
          <Box
            component="img"
            src={easyImage}
            alt="Easy"
            sx={{
              width: "280px",
              height: "auto",
              borderRadius: "15px",
              border: "3px solid transparent",
              background: "linear-gradient(45deg, #4caf50, #8bc34a) padding-box, linear-gradient(45deg, #4caf50, #8bc34a, #cddc39) border-box",
              boxShadow: "0px 0px 30px rgba(76, 175, 80, 0.6), inset 0px 0px 20px rgba(255, 255, 255, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0px 0px 40px rgba(76, 175, 80, 1), inset 0px 0px 25px rgba(255, 255, 255, 0.2)",
                filter: "brightness(1.2) contrast(1.1)",
              },
            }}
          />
        </motion.div>

        {/* Medium Button */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ 
            y: [0, -25, 0],
            rotateY: [0, -5, 0]
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          whileHover={{
            scale: 1.1,
            rotateY: -10,
            z: 50,
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            cursor: "pointer",
            filter: "drop-shadow(0px 0px 20px rgba(255, 193, 7, 0.8))",
          }}
          onClick={() => navigate("/medium")}
        >
          <Box
            component="img"
            src={mediumImage}
            alt="Medium"
            sx={{
              width: "280px",
              height: "auto",
              borderRadius: "15px",
              border: "3px solid transparent",
              background: "linear-gradient(45deg, #ff9800, #ffc107) padding-box, linear-gradient(45deg, #ff9800, #ffc107, #ffeb3b) border-box",
              boxShadow: "0px 0px 30px rgba(255, 193, 7, 0.6), inset 0px 0px 20px rgba(255, 255, 255, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0px 0px 40px rgba(255, 193, 7, 1), inset 0px 0px 25px rgba(255, 255, 255, 0.2)",
                filter: "brightness(1.2) contrast(1.1)",
              },
            }}
          />
        </motion.div>

        {/* Hard Button */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ 
            y: [0, -18, 0],
            rotateY: [0, 8, 0]
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          whileHover={{
            scale: 1.1,
            rotateY: 15,
            z: 50,
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            cursor: "pointer",
            filter: "drop-shadow(0px 0px 20px rgba(244, 67, 54, 0.8))",
          }}
          onClick={() => navigate("/hard")}
        >
          <Box
            component="img"
            src={hardImage}
            alt="Hard"
            sx={{
              width: "280px",
              height: "auto",
              borderRadius: "15px",
              border: "3px solid transparent",
              background: "linear-gradient(45deg, #f44336, #e91e63) padding-box, linear-gradient(45deg, #f44336, #e91e63, #ff5722) border-box",
              boxShadow: "0px 0px 30px rgba(244, 67, 54, 0.6), inset 0px 0px 20px rgba(255, 255, 255, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0px 0px 40px rgba(244, 67, 54, 1), inset 0px 0px 25px rgba(255, 255, 255, 0.2)",
                filter: "brightness(1.2) contrast(1.1)",
              },
            }}
          />
        </motion.div>
      </Box>

      {/* Settings Button with Swamp Theme */}
      <IconButton
        onClick={() => setOpenSettings(true)}
        sx={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "rgba(46, 125, 50, 0.8)",
          color: "#c8e6c9",
          padding: "12px",
          borderRadius: "50%",
          border: "2px solid rgba(76, 175, 80, 0.6)",
          boxShadow: "0px 0px 15px rgba(76, 175, 80, 0.5)",
          "&:hover": { 
            backgroundColor: "rgba(46, 125, 50, 1)",
            boxShadow: "0px 0px 25px rgba(76, 175, 80, 0.8)",
            transform: "scale(1.1)",
          },
        }}
      >
        <SettingsIcon fontSize="large" />
      </IconButton>

      {/* Settings Modal with Swamp Theme */}
      <Modal open={openSettings} onClose={() => setOpenSettings(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "350px",
            backgroundColor: "rgba(46, 125, 50, 0.95)",
            padding: "30px",
            borderRadius: "20px",
            textAlign: "center",
            border: "3px solid rgba(76, 175, 80, 0.8)",
            boxShadow: "0px 0px 30px rgba(76, 175, 80, 0.6), inset 0px 0px 20px rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography
            sx={{ 
              fontFamily: "'Press Start 2P', sans-serif", 
              color: "#c8e6c9",
              fontSize: "18px",
              marginBottom: "20px",
              textShadow: "0px 0px 10px rgba(76, 175, 80, 0.8)",
            }}
          >
            Swamp Settings
          </Typography>

          <Box sx={{ width: "100%", marginTop: "20px" }}>
            <Typography
              sx={{ 
                fontSize: "14px", 
                fontWeight: "bold", 
                color: "#c8e6c9",
                marginBottom: "15px",
                fontFamily: "'Press Start 2P', sans-serif",
              }}
            >
              Volume Control
            </Typography>
            <Slider
              value={volume}
              min={0}
              max={1}
              step={0.01}
              onChange={(event, newVolume) => setVolume(newVolume)}
              sx={{ 
                color: "#8bc34a",
                "& .MuiSlider-thumb": {
                  backgroundColor: "#4caf50",
                  border: "2px solid #c8e6c9",
                  boxShadow: "0px 0px 10px rgba(76, 175, 80, 0.6)",
                },
                "& .MuiSlider-track": {
                  backgroundColor: "#8bc34a",
                  boxShadow: "0px 0px 8px rgba(139, 195, 116, 0.4)",
                },
                "& .MuiSlider-rail": {
                  backgroundColor: "rgba(200, 230, 201, 0.3)",
                },
              }}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Home;
