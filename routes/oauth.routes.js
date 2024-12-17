import {Router} from "express"
import passport from "../utils/passport.js"
const router= Router()
router.get('/', (req, res) => {
    res.send('<a href="/auth/google">Login with Google</a>');
  });
  
  router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));
  
  router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/profile');
    }
  );
  
  router.get('/profile', (req, res) => {
    if (!req.user) {
      return res.redirect('/');
    }
    res.json({
      message: 'Welcome to your profile!',
      user: req.user
    });
  });
  
  router.get('/logout', (req, res) => {
    req.logout((err) => {
        if(err) return res.status(500).json({error:"Logout Failed"});
        res.clearCookie("connect.sid"); 
        const googleLogoutURL = "https://accounts.google.com/logout";
        res.redirect(googleLogoutURL);
    });
  });
  router.get('/google-logout-redirect', (req, res) => {
    res.redirect("http://localhost:5000");
  });
  export default router
  