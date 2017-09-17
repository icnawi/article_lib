const express = require('express');
const router = express.Router();

//Bring in Article Model
let Article = require('../models/article')

//Bring in User Model
let User = require('../models/user')

//First Route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_article', {
        title: 'Add Article'
    });
});

//Get single article
router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        User.findById(article.author, function (err, user) {
            res.render('article', {
                article: article,
                author: user.name
            });
        });
    });
});

//Add submit POST Route
router.post('/add', (req, res) => {
    req.checkBody('title', 'Title is required').notEmpty();
    //    req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();


    //Get Errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save((err) => {
            if (err) {
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article Added')
                res.redirect('/');
            }
        })
    }
});

//Edit Button Routing to through the articles
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if (article.author != req.user._id) {
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        } else {
            res.render('edit_article', {
                title: 'Edit Article',
                article: article
            })
        }
    });
});

router.post('/edit/:id', (req, res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    let query = {
        _id: req.params.id
    }

    Article.update(query, article, (err) => {
        if (err) {
            res.send(err)
            return;
        } else {
            res.redirect('/');
        }
    });
});
router.delete('/:id', ensureAuthenticated, (req, res, next) => {
    if (!req.user._id) {
        res.sendStatus(403);
    }
    let query = {
        _id: req.params.id
    };
    Article.findById(req.params.id, (err, article) => {
        if (article.author != req.user._id) {
            res.sendStatus(403);
        } else {
            Article.remove(query, (err) => {
                if (err) {
                    console.log(err);
                }
                res.send('Success')
            });
        }
    });
});

//Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;
