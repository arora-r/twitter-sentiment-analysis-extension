browser.runtime.onMessage.addListener(function (message) {
  if (message.type === "resetSentiment") tweetSentiment = {};
});

// We've got all the tweets on load (apparently not working for some reason, looks like its not loading fast enough?)
window.addEventListener("load", function () {
  doSentimentAnalysis();
});
// We've got all the tweets on load (apparently not working for some reason, looks like its not loading fast enough?)
document.addEventListener("DOMContentLoaded", function () {
  doSentimentAnalysis();
});

// We've got all the tweets on each scroll
document.addEventListener("scroll", function () {
  doSentimentAnalysis();
});

function categorizeAllTweets(tweets) {
  tweets.forEach((tweet) => {
    categorizeTweet(tweet);
  });
}

tweetSentiment = {};

function categorizeTweet(tweet) {
  if (tweet.hasAttribute("sentiment")) return;
  // Does not handle the case with only an image
  const spans = tweet.querySelectorAll("span");
  const spanTexts = [];
  spans.forEach((span) => {
    spanTexts.push(span.innerText);
  });
  text = spanTexts.join(" ");

  if (text in tweetSentiment) {
    sentiment = tweetSentiment[text];
    tweet.setAttribute("sentiment", sentiment);
    return;
  }

  // Call the sentiment analysis function
  const sentiment = analyzeSentiment(text);
  tweet.setAttribute("sentiment", sentiment);
}

async function analyzeSentiment(text) {
  const sentiment = await sendRequest(text);
  console.log("SENTIMENT IS SET TO", sentiment);
  tweetSentiment[text] = sentiment; // save in an object
  browser.runtime.sendMessage({
    type: "sentiment",
    data: tweetSentiment,
  });
  return sentiment;
}

const controller = new AbortController();
const signal = controller.signal;

async function sendRequest(text) {
  const containerUrl =
    "http://localhost:8080/v1/watson.runtime.nlp.v1/NlpService/SentimentPredict";

  // Set the request body
  const postData = {
    rawDocument: {
      text: text,
    },
  };

  try {
    const response = await fetch(containerUrl, {
      method: "POST",
      body: JSON.stringify(postData),
      headers: {
        "Content-Type": "application/json",
        "grpc-metadata-mm-model-id":
          "sentiment_aggregated-cnn-workflow_lang_en_stock",
      },
      signal,
    });
    const data = await response.json();

    // Handle the response data from the Docker container
    const label = data["documentSentiment"]["label"];
    if (label == "SENT_POSITIVE") return 1;
    if (label == "SENT_NEGATIVE") return -1;
    return 0;
  } catch (error) {
    // Handle any errors that occurred while making the request
    console.error(error);
  }
}

function doSentimentAnalysis() {
  tweets = document.querySelectorAll('[data-testid="tweetText"]');
  categorizeAllTweets(tweets);
}
