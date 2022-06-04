const express = require('express');
const { render } = require('express/lib/response');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');
const Story = require('../models/Story');


//@desc show public stories
//@route get /stories
router.get('/', ensureAuth, async (req,res)=>{
    try {
        const stories = await Story.find({status:'public'})
        .populate('user')
        .sort({createdAt:'desc'})
        .lean();


        res.render('stories/index',{stories});
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
    
});

//@desc show a story
//@route get /stories/:id
router.get('/:id', ensureAuth, async (req,res)=>{
    try {
        let story = await Story.findById(req.params.id)
        .populate('user')
        .lean();
        if(!story){
            return res.render('error/404')
        }
        //check id the user owns the story
        if(story.status=='private'){
            if(story.user!=req.user.id){
                res.redirect('/stories')
            }
            else{
                return res.render('stories/story',{story})
            }
        }
        return res.render('stories/story',{story})
       
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
    
});

//@desc show add page
//@route get /stories/add
router.get('/add', ensureAuth, (req,res)=>{
    res.render('stories/add');
});

//@desc process add form
//@route post /stories/add
router.post('/add', ensureAuth, async (req,res)=>{
    try {
        req.body.user = req.user.id;
        await Story.create(req.body);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});


//@desc show edit page
//@route get /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req,res)=>{
    const story = await Story.findOne({
        _id: req.params.id 
    }).lean()

    if(!story){
        return res.render('error/404')
    }
    //check id the user owns the story
    if(story.user!=req.user.id){
        res.redirect('/stories')
    }else{
        res.render('stories/edit',{
            story,
        })
    }
});

//@desc process edit form
//@route post /stories/edit/:id
router.put('/edit/:id', ensureAuth, async (req,res)=>{
    
        let story = await Story.findById(req.params.id).lean();
        if(!story){
            return res.render('error/404')
        }
        //check id the user owns the story
        if(story.user!=req.user.id){
            res.redirect('/stories')
        }else{
           story = await Story.findOneAndUpdate({_id: req.params.id}, req.body,
            {new: true, runValidators: true} )}
        res.redirect('/dashboard');
 
});

//@desc process edit form
//@route post /stories/edit/:id
router.delete('/delete/:id', ensureAuth, async (req,res)=>{
    
    let story = await Story.findById(req.params.id).lean();
    if(!story){
        return res.render('error/404')
    }
    //check id the user owns the story
    if(story.user!=req.user.id){
        res.redirect('/stories')
    }else{
       story = await Story.remove({_id: req.params.id} )}
    res.redirect('/dashboard');

});

//@desc show stories of a certain user
//@route get /stories
router.get('/user/:userId', ensureAuth, async (req,res)=>{
    try {
        const stories = await Story.find({user:req.params.userId, status:'public'})
        .populate('user')
        .sort({createdAt:'desc'})
        .lean();

        res.render('stories/index',{stories});
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
    
});



module.exports = router ;