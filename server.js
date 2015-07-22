var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var obj = JSON.parse(fs.readFileSync('users.json', 'utf8'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var server = app.listen(process.env.PORT || 80, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Football Genius app listening at http://%s:%s', host, port);
});

app.use(favicon(path.join(__dirname, 'public', 'favic.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use("/web/sign",function(req,res){
    var exist = findUser(req.body.userName);
    if(exist != -1){
        res.sendFile(__dirname+"/web/signInWithError.html");

    }else {
        var newUser = {
            "username": req.body.userName,
            "password":req.body.password,
            "score": 0,
            "team": req.body.selectedTeam,
            "questions": []
        }
        obj.users.push(newUser);
        var string = JSON.stringify(obj);
        fs.writeFileSync("users.json", string);
        obj = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        res.cookie('username', req.body.userName);
        res.cookie('team', req.body.selectedTeam);
        res.sendFile(__dirname + "/web/main.html");
    }
});

app.use("/web/log",function(req,res){
    var userIndex = findUser(req.body.userName);
    if(userIndex != -1) {
        if (req.body.password == obj.users[userIndex].password) {
            res.cookie('username', req.body.userName);
            res.cookie('team', obj.users[userIndex].team);
            res.sendFile(__dirname + "/web/main.html");
        }else{
            res.sendFile(__dirname+"/web/logInWithError.html");
        }
    }else {
        res.sendFile(__dirname+"/web/logInWithError.html");
    }
});

app.use("/web/newQuestion",function(req,res){
    var jsonQuest = {"question":req.body.question, "a":req.body.a, "b":req.body.b, "c":req.body.c,
        "d":req.body.d, "correctAnswer":req.body.correctAnswer};
    var userIndex = findUser(req.cookies.username);
    for(var i = 0; i < obj.users.length; i++){
        if(i != userIndex){
            obj.users[i].questions.push(jsonQuest);
        }
    }
    var string = JSON.stringify(obj);
    fs.writeFileSync("users.json", string);
    obj = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    res.sendFile(__dirname + "/web/main.html");

});

app.use("/web/checkAnswer",function(req,res){
    var userIndex = findUser(req.cookies.username);
    if(req.body.correctAnswer == req.cookies.quest.correctAnswer) {
        console.log("correct");
        obj.users[userIndex].score++;
    }else{
        console.log("false");
    }
    for(var j = 0; j <  obj.users[userIndex].questions.length; j++) {
        if (obj.users[userIndex].questions[j].question == req.cookies.quest.question) {
            obj.users[userIndex].questions.splice(j,1);
        }
    }
    var string = JSON.stringify(obj);
    fs.writeFileSync("users.json", string);
    obj = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    res.sendFile(__dirname + "/web/main.html");

});


app.use("/web/topTen?",function(req,res){
    res.sendFile(__dirname + "/web/topTen.html");
});

app.use("/web/fillTopTen",function(req,res){
    obj.users.sort(predicatBy("score"));
    var image =  req.cookies.team+".jpg";
    var len;
    if(obj.users.length > 10){
        len = 10;
    }else{
        len = obj.users.length;
    }
    var topten = obj.users.slice(0,len);
    obj = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    res.send({"topTen":topten, "backGroundPic":image});
});




app.post("/web/answerQuestion",function(req,res){
    var userName = req.cookies.username;
    var userIndex = findUser(userName);
    res.cookie('quest', obj.users[userIndex].questions[req.body.selected]);
    res.sendFile(__dirname + "/web/answer.html");
});

app.use("/web/fillAnswerPage",function(req,res){
    res.send({"name": req.cookies.username, "quest":req.cookies.quest, "backGroundPic":req.cookies.team+".jpg"});
});



app.use("/web/fillQuestList",function(req,res){
    var questions;
    var score;
    var userIndex = findUser(req.cookies.username);
    score = obj.users[userIndex].score;
    questions = obj.users[userIndex].questions;
    console.log("pic     "+req.cookies.team+".jpg");
    res.send({"name": req.cookies.username, "score":score, "questions":questions, "backGroundPic":req.cookies.team+".jpg"});

});
app.use("/web/reConnect",function(req,res){
    res.clearCookie('username');
    res.clearCookie('team');
    res.redirect("/web/main.html");
});

app.use("/web/main.html",function(req,res){
    var userIndex = -1;
    console.log("dcasc"+req.cookies.username);
    if(req.cookies.username){
        userIndex = findUser(req.cookies.username);
    }
    if(userIndex != -1) {
        res.sendFile(__dirname + "/web/main.html");
    }else {
        res.sendFile(__dirname + "/web/logIn.html");
    }
});

app.get("/partners.html",function(req,res){
    res.sendFile(__dirname+"/web/partners.html");
});
app.get("/help.html",function(req,res){
    res.sendFile(__dirname+"/web/help.html");
});
app.get("/heroku.html",function(req,res){
    res.sendFile(__dirname+"/web/heroku.html");
});

app.get("/public/images/background.jpg",function(req,res){
    res.sendFile(__dirname+"/public/images/background.jpg");
});
app.get("/web/chelsea.jpg",function(req,res){
    res.sendFile(__dirname+"/public/images/chelsea.jpg");
});
app.get("/web/manUtd.jpg",function(req,res){
    res.sendFile(__dirname+"/public/images/manUtd.jpg");
});
app.get("/web/barcelona.jpg",function(req,res){
    res.sendFile(__dirname+"/public/images/Barcelona.jpg");
});
app.get("/web/realMadrid.jpg",function(req,res){
    res.sendFile(__dirname+"/public/images/realMadrid.jpg");
});
app.get("/web/juventus.jpg",function(req,res){
    res.sendFile(__dirname+"/public/images/juventus.jpg");
});



function findUser(username){
    for(var i = 0; i < obj.users.length; i++){
        if(obj.users[i].username == username){
            return i;
        }
    }
    return -1;
}

function predicatBy(prop){
    return function(a,b){
        if( a[prop] > b[prop]){
            return -1;
        }else if( a[prop] < b[prop] ){
            return 1;
        }
        return 0;
    }
}



app.use('/users', users);

//var server = app.listen(8080, function () {
//
//  var host = server.address().address;
//  var port = server.address().port;
//
//  console.log('listening at http://%s:%s', host, port);
//
//});

//
//// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  var err = new Error('Not Found');
//  err.status = 404;
//  next(err);
//});
//
//// error handlers
//
//// development error handler
//// will print stacktrace
//if (app.get('env') === 'development') {
//  app.use(function(err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//      message: err.message,
//      error: err
//    });
//  });
//}
//
//// production error handler
//// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//  res.status(err.status || 500);
//  res.render('error', {
//    message: err.message,
//    error: {}
//  });
//});


module.exports = app;
