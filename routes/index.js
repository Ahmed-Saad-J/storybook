const express = require('express');
const router = express.Router();
const {ensureAuth, ensureGuest} = require('../middleware/auth');
const Story = require('../models/Story');

//home/login poage
router.get('/', ensureGuest, (req,res)=>{
    res.render('login',{layout:'login'});
});

//dashboard poage
router.get('/dashboard', ensureAuth, async (req,res)=>{
    try {
        const stories = await Story.find({user: req.user.id}).lean();
        res.render('dashboard',{
            name: req.user.firstName,
            stories
        });
    } catch (err) {
        console.log(err);
        res.render('errors/500');
    }

 
})

module.exports = router ;