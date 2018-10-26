const Twitter = require('twitter');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const Sentiment = require('sentiment');
require('dotenv').config();

var stream=null;
var tweetCount = 0;
var tweetTotalSentiment = 0;
var chartData = [0,0,0]
var monitoringPhrase;
const port = process.env.PORT || 9000;
const app = express();
var sentiment = new Sentiment();
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'));
app.set('view engine', 'hbs');


var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

app.get('/', (req,res) => {
  if (!monitoringPhrase) {
    res.render('index');
  }
  else {
    res.render('analysis', {host:req.headers.host, score: updateSentiment(), phrase: monitoringPhrase, numberOfTweets: tweetCount, chartData: chartData});
  }
});

app.get('/monitor', (req, res) => {
  beginMonitoring(req.query.phrase);
  res.redirect(302, '/');
});

app.get('/reset', (req, res) => {
  resetMonitoring();
  res.redirect(302, '/');
});

function resetMonitoring() {
  if(stream) {
    stream.destroy();
  }
  monitoringPhrase = "";
}

function beginMonitoring(phrase) {
  if(monitoringPhrase) {
    resetMonitoring();
  }
  monitoringPhrase = phrase;
  tweetCount=0;
  tweetTotalSentiment=0;
  chartData=[0,0,0]
  stream = client.stream('statuses/filter', {track: monitoringPhrase}, function(inStream) {
    stream = inStream;
    stream.on('data', function(data) {
      if(data.lang === 'en') {
        sentiment.analyze(data.text, function (err, result) {
          tweetCount++;
          tweetTotalSentiment += result.score;
          if(result.score > 0.5)
            chartData[0]++;
          else if(result.score < -0.5)
            chartData[1]++;
          else
            chartData[2]++;
        });
      }
    });
    stream.on('error', (error, code) => {
      inStream.destroy();
      resetMonitoring();
      console.error(error);
    });
    stream.on('end', (response) => {
      if(stream) {
        inStream.destroy();
        resetMonitoring();
        console.error("Stream ended unexpectedly.");

      }
    });
    stream.on('destroy', (response) => {
      inStream.destroy();
      resetMonitoring();
      console.error("Stream destroyed unexpectedly.");
    });
  });
  return stream;
}

function updateSentiment() {
  var avg = tweetTotalSentiment/tweetCount;
  if(avg > 0.5) {
    return "positive";
  }
  if(avg < -0.5) {
    return "negative";
  }
  return "neutral";
}

app.listen(port, () => {
  console.log("Listening on port ", port);
});
