const TrainingSet = require("./trainingData.json");
const natural = require("natural");
const BrainJs = require("brain.js");

function buildWordDictionary(trainingData) {
  const tokenisedArray = trainingData.map((item) => {
    const tokens = item.phrase.split(" ");
    return tokens.map((token) => natural.PorterStemmer.stem(token));
  });

  const flattenedArray = [].concat.apply([], tokenisedArray);
  return flattenedArray.filter((item, pos, self) => self.indexOf(item) == pos);
}

const dictionary = buildWordDictionary(TrainingSet);

function encode(phrase) {
  const phraseTokens = phrase.split(" ");
  const encodedPhrase = dictionary.map((word) =>
    phraseTokens.includes(word) ? 1 : 0,
  );

  return encodedPhrase;
}

const encodedTrainingSet = TrainingSet.map((dataSet) => {
  const encodedValue = encode(dataSet.phrase);
  return { input: encodedValue, output: dataSet.result };
});

const network = new BrainJs.NeuralNetwork();
network.train(encodedTrainingSet);

const encoded = encode("Im so happy to have cake");
console.log(network.run(encoded));
export const detectTradePaperbacks = (deck: string): any => {};
