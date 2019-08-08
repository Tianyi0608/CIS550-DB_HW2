var express = require('express');
var router = express.Router();
var path = require('path');

// var bodyParser = require('body-parser')
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())

// Connect string to MySQL
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'fling.seas.upenn.edu',
  user: 'zty',
  password: '***',
  database: 'zty'
});

connection.connect(function(err) {
  if (err) {
    console.log("Error Connection to DB" + err);
    return;
  }
  console.log("Connection established...");
});

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
});

// Login uses POST request
router.post('/login', (req, res) => {
  // use console.log() as print() in case you want to debug, example below:
  // console.log(req.body); will show the print result in your terminal
  // req.body contains the json data sent from the loginController
  // e.g. to get username, use req.body.username
  console.log(req.body);
  var query = "INSERT INTO User (username, password) VALUES ("+req.body.username+","+req.body.password+") ON DUPLICATE KEY UPDATE password="+req.body.password+";"; /* Write your query here and uncomment line 21 in javascripts/app.js*/
  connection.query(query, function(err, rows, fields) {
    console.log("rows", rows);
    console.log("fields", fields);
    if (err) console.log('insert error: ', err);
    else {
      res.json({
        result: 'success'
      });
    }
  });
});

//GET dashboard page
router.get('/dashboard', function (req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

router.get('/usernames', function (req, res) {
  var query = "SELECT DISTINCT username FROM User;";
//   console.log(query);
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {     
	  console.log(rows);
      res.json(rows);      
    }
  });
  
});

router.get('/genres', function (req, res) {
  var query = "SELECT DISTINCT genre FROM Genres ORDER BY genre";
//   console.log(query);
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {     
	  console.log(rows);
      res.json(rows);      
    }
  });
  
});

router.get('/genres/:genre', function (req, res) {
  var slgenre = req.params.genre;
  console.log(slgenre)
  var query = "Select Genres.genre, Movies.title, Movies.rating, Movies.vote_count From Movies, Genres Where Movies.id=Genres.movie_id And Genres.genre='"+slgenre+"' Order By Movies.rating DESC, Movies.vote_count DESC Limit 10;";
  console.log(query);
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {     
	  console.log(rows);
      res.json(rows);      
    }
  });
  
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});


router.get('/recommendations', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommendations.html'));
});


router.post('/rcmdmovies', function (req, res) {
  console.log(req.body)
  var movieid1 = req.body.movieid1;
  var movieid2 = req.body.movieid2;
  var movieid3 = req.body.movieid3;
  
  //genre with max count
  var query = "Select genre From Genres Where movie_id IN ("+movieid1+","+movieid2+","+movieid3+") Group by genre Order by Count(*) DESC Limit 1;";
  console.log(query);
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {     
	  console.log(rows);
      res.json(rows);      
    }
  });
});


//GET bestof page
router.get('/bestof', function (req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'bestof.html'));
});

router.get('/decades', function (req, res) {
  var query = "SELECT FLOOR(Movies.release_year/10)*10 AS decade FROM Movies GROUP BY FLOOR(Movies.release_year/10)*10"
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {     
	  console.log(rows);
      res.json(rows);      
    }
  });
});


router.post('/topmovie', function (req, res) {
  console.log(req.body.sldecade*1+9)
//   cosole.log(req.body.sldecade)
  var query = "SELECT Genres.genre, Movies.title, Movies.release_year, Movies.vote_count FROM Movies, Genres, (SELECT genre, Max(vote_count) AS topvote FROM Movies, Genres WHERE Movies.id=Genres.movie_id AND release_year>="+(req.body.sldecade*1)+" AND release_year<="+(req.body.sldecade*1+9)+" GROUP BY genre) Top WHERE Movies.id=Genres.movie_id AND release_year>="+(req.body.sldecade*1)+" AND release_year<="+(req.body.sldecade*1+9)+" AND Genres.genre=Top.genre AND Movies.vote_count=Top.topvote ORDER BY Genres.genre"
  console.log(query)
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {     
	  console.log(rows);
      res.json(rows);      
    }
  });
});//router

router.get('/posters', function (req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'posters.html'));
});


router.get('/movieid', function (req, res) {
  var n=Math.round(Math.random()*5+10);
  var query = "SELECT imdb_id FROM Movies ORDER BY rand() Limit "+n+";"
  console.log(query)
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {     
	  console.log(rows);
      res.json(rows);      
    }
  });
});


router.get('/:mvid', function(req, res) {

var http = require('http');
var mvid = req.params.mvid;

var options = {
   host: 'www.omdbapi.com',
   port: '80',
   path: '/?apikey=e59d84dc&i='+mvid  
};

var callback = function(response){
   // 不断更新数据
   var body = '';
   response.on('data', function(data) {
      body += data;
   });
   
   response.on('end', function() {
      // 数据接收完成
      console.log(body);
      res.json(body);
   });
}
// 向服务端发送请求
var req = http.request(options, callback);
req.end();

//console.log(body);


// var mvid = req.params.mvid;
// console.log('http://www.google.com'+mvid)
// const https = require('https');
// //http://www.omdbapi.com/?apikey=e59d84dc&i=:mvid
// https.post('http://www.google.com', (resp) => {
//   let data = '';
// 
//   // A chunk of data has been recieved.
//   resp.on('data', (chunk) => {
//     console.log(chunk)
//     data += chunk;
//   });
// 
//   // The whole response has been received. Print out the result.
//   resp.on('end', () => {
//     console.log(JSON.parse(data).explanation);
//   });
// 
// }).on("error", (err) => {
//   console.log("Error: " + err.message);
// });


// 'http://www.omdbapi.com/?apikey=e59d84dc&i='+mvid
// var request = require("request"); 
// request('http://www.google.com', function (error, response, body) { 
//     if (!error){
//       console.log(body);
//     }  
//     else{
//       console.log(1111111)
//       console.log(error); 
//     }    
// }); 

});//router.get()

// template for GET requests
/*
router.get('/routeName/:customParameter', function(req, res) {

  var myData = req.params.customParameter;    // if you have a custom parameter
  var query = '';

  // console.log(query);

  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});
*/

module.exports = router;
