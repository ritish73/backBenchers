var express = require("express");
var app = express();
var router  = express.Router();
const dashboardObj = require("../controllers/dashboardcontroller.js");
const auth = require("../middleware/auth.js");
var moment = require("moment");
const check = require("../controllers/checkAuthcontroller");
router.get("/showAllArticles", auth,  async (req,res)=>{
    var getArticles;
    await dashboardObj.getTotalArticles(req)
    .then((posts)=>{
      getArticles = posts;
    })
  
    let pageoffset = req.query.page-1;
    let len = getArticles.length;
    let val = pageoffset*10;
    let limit=0;
    var page = parseInt(req.query.page);
    var nextpage = page+1;
  
    console.log("next",nextpage, " page : ",page)
    let start = val;
    var shownextbutton=false;
    // impoertant
    // len-val gives number of cards to be shown on a particular page
  
    if(len-val>10){
      shownextbutton=true;
    }
    if(len-val <= 9){
       limit = len-1;
    } else {
      limit = val+9;
    }
    res.render('showallarticlesofauthor',{
      posts: getArticles,  
      start: start, 
      limit: limit,
      nextpage: nextpage,
      page:page,
      shownextbutton: shownextbutton
    });
  })
  
  router.get("/showAllFollowers", auth,  async (req,res)=>{
    var getFollowers;
    await dashboardObj.getTotalFollowers(req)
    .then((followers)=>{
      console.log("followers : ..............", followers)
      getFollowers = followers;
    })
    
    res.render('showfollowers',{followers: getFollowers});
  })
  
  

  router.get("/showSavedArticles", auth, async (req,res)=>{

    try{

    var getSavedArticles;
    await dashboardObj.getSavedArticles(req)
    .then((SavedArticles)=>{
      if(SavedArticles.length === 0){
        throw new Error('You have not saved any article currently.')
      }
      console.log("SavedArticles : ..............", SavedArticles)
      getSavedArticles = SavedArticles;
    })
  
  
  
    let pageoffset = req.query.page-1;
    let len = getSavedArticles.length;
    let val = pageoffset*10;
    let limit=0;
    var page = parseInt(req.query.page);
    var nextpage = page+1;
  
    console.log("next",nextpage, " page : ",page)
    let start = val;
    var shownextbutton=false;
    // impoertant
    // len-val gives number of cards to be shown on a particular page
  
    if(len-val>10){
      shownextbutton=true;
    }
    if(len-val <= 9){
       limit = len-1;
    } else {
      limit = val+9;
    }
    res.render('showSavedArticles',{
      posts: getSavedArticles,  
      start: start, 
      limit: limit,
      nextpage: nextpage,
      page:page,
      shownextbutton: shownextbutton
    })






    } catch(e){

      req.flash('error', e.message);
        res.redirect('/dashboard');

    }

  
  })
  
  
  
  router.get("/showSharedArticles", auth,  async (req,res)=>{

    try{



      var getSharedArticles;
    await dashboardObj.getSharedArticles(req)
    .then((SharedArticles)=>{
      if(SharedArticles.length === 0){
        throw new Error('You have not shared any article.')
      }
      console.log("SharedArticles : ..............", SharedArticles)
      getSharedArticles = SharedArticles;
    })
    
  
    let pageoffset = req.query.page-1;
    let len = getSharedArticles.length;
    let val = pageoffset*10;
    let limit=0;
    var page = parseInt(req.query.page);
    var nextpage = page+1;
  
    console.log("next",nextpage, " page : ",page)
    let start = val;
    var shownextbutton=false;
    // impoertant
    // len-val gives number of cards to be shown on a particular page
  
    if(len-val>10){
      shownextbutton=true;
    }
    if(len-val <= 9){
       limit = len-1;
    } else {
      limit = val+9;
    }
    res.render('showSharedArticles',{
      posts: getSharedArticles,  
      start: start, 
      limit: limit,
      nextpage: nextpage,
      page:page,
      shownextbutton: shownextbutton
    });




    } catch(e){

      req.flash('error', e.message)
        res.redirect("/dashboard");
      
    }
    
  
  })
  
  
  router.get("/dashboard", auth, async (req,res)=>{
    // for users who logged in with google or fb handle accordingly
    // console.log("req.user : ", req.user)
    var articlesCount;
    if(req.user.role === 'user') articlesCount = 0;
    else articlesCount = req.user.posts.length;
  
    var followersCount;
    if(req.user.role === 'user') followersCount = 0;
    else followersCount = req.user.followers.length;
  
  
    var getTotalNumberOfLikes;
    await dashboardObj.getTotalNumberOfLikes(res,req)
    .then((likes)=>{
      getTotalNumberOfLikes = likes;
    })
  
  
    // get array of articles saved
    var savedArticlesCount; 
    savedArticlesCount = req.user.saved_for_later.length;
    //get number of shared posts
    var sharedArticlesCount; 
    sharedArticlesCount = req.user.shared_posts.length;
    var getdob = undefined;
    if(req.user.dob){
     getdob = moment(req.user.dob).format(moment.HTML5_FMT.DATE);
    } 
    // var year = req.user.dob.toString().substring(0,4);
    // var month = req.user.dob.toString().substring(0,4);
    // var day
    // console.log(getTotalArticles, getTotalSubscribers, getTotalNumberOfLikes)
    var message = '';
    if(req.query.message){
      message = req.query.message
    }
    res.render("dashboard",{
      articlesCount: articlesCount,
      followersCount: followersCount,
      totalLikes: getTotalNumberOfLikes,
      savedArticlesCount: savedArticlesCount,

      sharedArticlesCount: sharedArticlesCount,
      getdob: getdob,
      gender: req.user.gender,
      message: message
    })
  })
  
  module.exports = router