import { Router } from 'express';
import api from 'routes/api';

const router = Router();

router.use('/', api);

export default router;
