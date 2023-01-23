let tweetSentiment = {};
let sentimentValues = [];

function countSentiments(obj) {
  let values = Object.values(obj);
  let counts = values.reduce(
    (acc, val) => {
      acc[String(val)]++;
      return acc;
    },
    { "-1": 0, 0: 0, 1: 0 }
  );

  return counts;
}

browser.runtime.onMessage.addListener(function (message) {
  if (message.type === "sentiment") tweetSentiment = message.data;
  else if (message.type === "reset") tweetSentiment = {};

  sentimentObject = countSentiments(tweetSentiment);
  sentimentValues = [
    sentimentObject["-1"],
    sentimentObject["0"],
    sentimentObject["1"],
  ];
  browser.runtime.sendMessage({
    type: "sentimentValues",
    data: sentimentValues,
  });
});
