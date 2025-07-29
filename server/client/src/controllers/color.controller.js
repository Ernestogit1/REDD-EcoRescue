const { cloudinary } = require('../../../config/cloudinary');
const Color = require('../../../database/models/color.model'); 

const uploadImage = async (req, res) => {
    try {
        const { imageData } = req.body;

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!imageData) {
            return res.status(400).json({
                success: false,
                message: "No image data provided"
            });
        }

        // Upload to Cloudinary
        let uploadResponse;
        try {
            uploadResponse = await cloudinary.uploader.upload(imageData, {
                resource_type: "image",
                folder: "redd_game_colors",
                quality: "auto",
                fetch_format: "auto"
            });
        } catch (cloudinaryError) {
            console.error('Cloudinary upload error:', cloudinaryError);
            return res.status(500).json({
                success: false,
                message: "Failed to upload image to cloud storage"
            });
        }

        // Save to database
        const newColorImage = new Color({
            userId: req.user._id,
            imageUrl: uploadResponse.secure_url,
            cloudinaryPublicId: uploadResponse.public_id,
            createdAt: new Date()
        });

        await newColorImage.save();

        res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                imageUrl: uploadResponse.secure_url,
                publicId: uploadResponse.public_id
            }
        });

    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// New function to get all user's images
const getUserImages = async (req, res) => {
    try {
        const userId = req.user._id;
        const images = await Color.find({ userId })
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            data: images
        });
    } catch (error) {
        console.error('Get user images error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user images",
            error: error.message
        });
    }
};

// ADD THIS NEW FUNCTION
const getLeaderboard = async (req, res) => {
    try {
        console.log('Fetching color leaderboard...');
        
        const leaderboard = await Color.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $group: {
                    _id: '$userId',
                    username: { $first: '$user.username' },
                    rank: { $first: '$user.rank' },
                    imagesCreated: { $sum: 1 },
                    latestImage: { $last: '$createdAt' }
                }
            },
            { $sort: { imagesCreated: -1, latestImage: -1 } },
            { $limit: 50 }
        ]);

        console.log('Color leaderboard data:', leaderboard);
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching color leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard', error });
    }
};

module.exports = { 
    uploadImage, 
    getUserImages,
    getLeaderboard // ADD THIS
};