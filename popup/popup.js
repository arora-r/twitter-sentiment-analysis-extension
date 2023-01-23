function createPieChart(data) {
  document.getElementById("myChart").remove();
  const canvas = document.createElement("canvas");
  canvas.id = "myChart";
  canvas.height = 400;
  canvas.width = 400;
  document.body.appendChild(canvas);
  const ctx = document.getElementById("myChart").getContext("2d");
  const graph = {
    type: "pie",
    data: {
      labels: ["Negative", "Neutral", "Positive"],
      datasets: [
        {
          label: "Sentiment Analysis",
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.3)",
            "rgba(54, 162, 235, 0.3)",
            "rgba(50, 168, 82, 0.3)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(50, 168, 82, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
    },
  };
  new Chart(ctx, graph);
  return;
}

sentimentValues = [];

browser.runtime.sendMessage({ type: "getSentiment" });

const reset = document.createElement("button");
reset.style = "display:block; margin: 0 auto; margin-bottom: 0.5rem;";
reset.textContent = "Reset";
reset.addEventListener("click", () => {
  browser.runtime.sendMessage({ type: "reset" });
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    // Send a message to the content script in the active tab
    browser.tabs.sendMessage(tabs[0].id, {
      type: "resetSentiment",
    });
  });
});
document.body.appendChild(reset);

browser.runtime.onMessage.addListener(function (message) {
  if (message.type === "sentimentValues") sentimentValues = message.data;
  console.log("Values; ", sentimentValues);
  createPieChart(sentimentValues);
});
