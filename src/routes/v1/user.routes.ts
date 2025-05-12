import { Router } from 'express';
import { UserController } from '../../modules/user-management/controllers/user.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();


router.post('/register/initiate', UserController.initiateRegistration);
router.post('/register/verify', UserController.verifyEmailAndCreateUser);
router.post('/login', UserController.login);
router.post('/refresh-token', UserController.refreshToken);
router.get('/user', authenticate, UserController.getUser);
router.get('/:id', authenticate, UserController.getUserByIdPublic);

router.get('/test', (_req, res) => {
  res.send('User route is working!');
});

export default router;
