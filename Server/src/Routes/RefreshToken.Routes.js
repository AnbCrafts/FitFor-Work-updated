import { Router } from 'express';
import { refreshAccessToken } from '../Controllers/RefreshToken.Controllers.js';
import { verifyJWT } from '../Middlewares/VerifyJWT.Middleware.js';

const AuthRouter = Router();

// Route to refresh the Access Token using the Refresh Token Cookie
// This is usually called by a Frontend Axios Interceptor when a 401 error occurs
AuthRouter.post('/refresh-token', refreshAccessToken);

// It's also a good time to add the Logout route, 
// as it needs to clear both cookies

export default AuthRouter;