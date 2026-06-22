import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import StudySession from '../models/StudySession.js';

export const getAchievements = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const achievements = await Achievement.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAndAwardAchievements = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const sessions = await StudySession.find({ userId });
    const totalStudyTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    
    const user = await User.findById(userId);
    const newAchievements = [];

    if (totalStudyTime >= 3600 && !user.achievements?.includes('first_hour')) {
      newAchievements.push({
        userId,
        type: 'study_time',
        title: 'First Hour',
        description: 'Completed your first hour of study time',
        icon: '⏱️'
      });
    }

    if (totalStudyTime >= 36000 && !user.achievements?.includes('ten_hours')) {
      newAchievements.push({
        userId,
        type: 'study_time',
        title: 'Dedicated Learner',
        description: 'Completed 10 hours of study time',
        icon: '📚'
      });
    }

    if (newAchievements.length > 0) {
      await Achievement.insertMany(newAchievements);
      await User.findByIdAndUpdate(userId, {
        $push: { achievements: { $each: newAchievements.map(a => a.type) } }
      });
    }

    res.json({ success: true, newAchievements });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};