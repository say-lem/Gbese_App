import { Router } from 'express';
import { UserController } from '../../modules/user-management/controllers/user.controller';

const router = Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/test', (_req, res) => {
    res.send('User route is working!');
  });

export default router;
