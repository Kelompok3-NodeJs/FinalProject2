const { User } = require('../models');

async function authorization(req, res, next) {
  const userId = req.user.id; // Assuming you have the authenticated user ID in req.user
  const reflectionId = req.params.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Assuming there's an association between User and other models like Photo, SocialMedia, and Comment
    const userReflection = await user.getPhotos({
      where: { id: reflectionId },
    });

    if (!userReflection) {
      return res.status(404).json({ message: 'Reflection not found' });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
}

module.exports = {
  authorization,
};
