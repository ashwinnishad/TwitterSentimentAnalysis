# Twitter Sentiment Analysis

## About
This is a simple sentiment analysis model that processes a stream of tweets in order to establish an overall emotion based on user's input query.

The application uses a sentiment analysis node package, along with a Twitter package to stream tweets in real time. Individual tweets are then tokenized and analyzed. Each tweet is given a score and assigned either 'Positive', 'Negative' or 'Neutral' based on a threshold score set to 0.5.

Front end is designed using Handlebars template engine along with CSS. Server side uses Node.js and Express.js. 

Check it out [here](https://intense-everglades-10883.herokuapp.com)!
![](appgif.gif)

## Issues
The Twitter node package currently does not have a method to destroy a stream connection. This causes the application to crash when too many queries are submitted as Twitter has rate limiting for its stream API. You can read more about that [here](https://developer.twitter.com/en/docs/basics/rate-limiting.html). If the application does crash, wait a few minutes as Heroku will restart the application once it detects a crash. 
