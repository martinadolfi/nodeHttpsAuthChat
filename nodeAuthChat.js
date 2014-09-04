var myVersion = "v0.1";
var fs = require('fs'),
    path = require('path'),
    readline = require('readline');
var myLdapFile = "ldapConfig.json";
var myLdapData = new Object();
var http = require('http');
var https = require('https');

//Use this files just for testing purposes, gerenate you own files so you info is secure
var keyFile = 'certs/myNodeTest.key';
var certFile = 'certs/myNodeTest.pem';

var privateKey = fs.readFileSync(keyFile, 'utf8');
var certificate = fs.readFileSync(certFile, 'utf8');

// Default Certificate and key Checks.
// Use the default certificates and keys just for testing purposes.
// Everybody has this keys!!!!
// You should generate you own keys.
var keyMd5 = "eaee1b7e0f284d486aee3d4488bc7bb9";
var certMd5 = "cfa461a97ebad8f31237d9c05500aa69";
var crypto = require('crypto');  // Just to check you are not using the default keys
var md5sum = crypto.createHash('md5');
md5sum.update(privateKey);
if (md5sum.digest('hex')==keyMd5){console.log("WARNING!!! You are using the default keys, anyone can see the traffic!!! (and the passwords you enter)" );};
md5sum = crypto.createHash('md5');
md5sum.update(certificate);
if (md5sum.digest('hex')==certMd5){console.log("WARNING!!! You are using the default certificate, anyone can see the traffic!!! (and the passwords you enter)");};

var url = require('url');
var passport = require('passport');
var WindowsStrategy = require('passport-windowsauth');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var users = new Object();
var app = express();
var httpsServer = https.createServer({key:privateKey, cert:certificate}, app);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'keyboard cat',resave:false,saveUninitialized:false}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// render config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


app.use(function(req, res, next){
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});

// Read LDAP Configuration from File and inject in WindowsStrategy
fs.readFile(myLdapFile, 'utf8', function (err, data) {
    if (err) {
        console.log('Error: ' + err);
        return;
    }
    myLdapData = JSON.parse(data);
    passport.use(new WindowsStrategy({
        ldap: myLdapData,
        integrated:      false
    }, function(profile, done){

        if (!profile){
            done(null,profile,"error en el usuario");
        }else{
            for ( var i in users ){
                users[i].write(profile.displayName + " logged in </br>");
            }
            done(null,profile);
        }

    }));
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


//session diagnostics
app.get('/session',restrict,function(req,res){
    res.end(req.session.toString());
});

//request diagnostics
app.get('/diag',function(req,res){
    diag(req,res);
});

//render chat interface
app.get('/talk',restrict,function(req,res){
    res.render('talk');

});

//render login
app.get('/login',function(req,res){
    res.render('login');
});

//process login
app.post('/login',passport.authenticate('WindowsAuthentication', {
        successRedirect: '/talk',
        failureRedirect: '/login',
        failureFlash:    true
}));

//serve static files in /public
app.use(express.static(__dirname + '/public'));

//process chat data
app.post('/data',restrict,function(req,res){
    user = req.user.displayName;
    users[user]=res;
    if (!users[user].headersSent) {
        users[user].setHeader('content-type', 'application/octet-stream');
    }
    req.on('data',function(data){
        for ( var i in users ){
            users[i].write(user + " --> " + data + "</br>");
        }
    });
});

httpsServer.listen(443);
console.log('Version ' + myVersion);
console.log('Server running at https://0.0.0.0/');

//restrict when no auth
function restrict(req, res, next) {
    if (req.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

//request diagnostics function
function diag(req,res){
    res.writeHead(200, {'Content-Type': 'json'});
    var obj = {prodUtilsVersion:myVersion,version:req.httpVersion, headers:req.headers, trailers:req.trailers, method:req.method, statusCode:req.statusCode, url:req.url};
    res.end(JSON.stringify(obj));
}
