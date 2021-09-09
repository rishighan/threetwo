import Classifier from "ml-classify-text";

export const detectTradePaperbacks = (deck: string): any => {
  const classifier = new Classifier({ nGramMin: 2, nGramMax: 2 });
  const positiveTPBIdentifiers = [
    "trade paperbacks",
    "TPB",
    "paperback",
    "hardcover",
    "collects the following issues",
    "collected issues",
    "collecting the issues",
    "collecting the following issues",
    "collected editions",
  ];
  const negativeTPBIdentifiers = ["mini-series"];

  classifier.train(positiveTPBIdentifiers, "Possibly a trade paperback");
  classifier.train(negativeTPBIdentifiers, "Not a trade paperback");
  if (deck) {

  console.log("DEC", deck);
    const predictions = classifier.predict(deck);

    if (predictions.length) {
      predictions.forEach((prediction) => {
        console.log(`${prediction.label} (${prediction.confidence})`);
        return prediction;
      });
    } else {
      console.log("No predictions returned.");
    }
  }
};
