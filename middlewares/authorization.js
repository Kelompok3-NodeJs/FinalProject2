const { User, Photo, Comment } = require('../models');

async function authorization(req, res, next) {
  const userId = res.locals.user.id; // Assuming you have the authenticated user ID in req.user
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

async function photoAuthorization(req, res, next) {
    const photoId = req.params.id;
    const authenticatedUserId = res.locals.user.id;

    try {
        const result = await Photo.findOne({
            where: {
                id: photoId
            }
        });
        
        if (!result) {
            return res.status(404).json({ message: 'result Not Found' });
        }

        if (result.UserId === authenticatedUserId) {
            return next(); // Pengguna memiliki akses ke foto, lanjutkan ke handler berikutnya
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

async function commentAuthorization(req, res, next) {
    try {
        const authenticatedUserId = res.locals.user.id;
        const comments = await Comment.findAll({
            where: {
                UserId: authenticatedUserId
            }
        });

        if (comments.length > 0) {
            return next();
        }
        return res.status(401).json({ message: 'Unauthorized' });
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports = {
  authorization,
  photoAuthorization,
  commentAuthorization
};
