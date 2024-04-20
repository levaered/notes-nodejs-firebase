import {Router} from 'express'
import {logIn, signUp, getUsers, giveAdminPermissions, createNote, getAllNotes, updateNote} from './controllers.js'
import { check } from 'express-validator';

import {authMiddleWare, idMiddleWare, roleMiddleWare} from './middlewares.js'
 
const router = Router();

router.post('/api/v1/log-in', logIn);
router.post('/api/v1/sign-up', [
    check('username', "Username can't be ampty").notEmpty(),
    check('password', "Password shoud be at least 8 symbols").isLength({min: 8}),
] , signUp);
router.get('/api/v1/users', roleMiddleWare(['ADMIN']), getUsers)
router.put('/api/v1/give-admin-permissions', roleMiddleWare(['ADMIN']), giveAdminPermissions);
router.post('/api/v1/create-note', idMiddleWare, createNote)
router.get('/api/v1/get-all-notes', idMiddleWare, getAllNotes)
router.put('/api/v1/update-note', idMiddleWare, updateNote)

export default router;