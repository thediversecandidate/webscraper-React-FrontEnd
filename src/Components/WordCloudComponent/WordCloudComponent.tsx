import React from "react";
import './WordCloudComponent.css';
import ReactWordcloud, { MinMaxPair, Optional, Options } from "react-wordcloud";

type WordCloudComponentProps = {
    article: ArticleRow;
}


const WordCloudComponent = ({ article }: WordCloudComponentProps) => {

    const size: MinMaxPair = [300, 300];
    const options: Optional<Options> = {
        fontFamily: "Times New Roman",
        fontWeight: "bold",
        fontSizes: [20, 40],
        rotationAngles: [0, 90],
        rotations: 2,
        enableTooltip: false,
    };

    const getWordCloudWords = (article: ArticleRow) => {
        let wordsCloud: WordCloud[] = [];

        let wordCloudWords = article.wordcloud_words.toLocaleLowerCase().split(' ');
        let wordCloudScores = article.wordcloud_scores.split(' ');

        let minValue = parseFloat(wordCloudScores[0]);
        let maxValue = parseFloat(wordCloudScores[0]);
        let maxWord = wordCloudWords[0];

        for (let j = 1; j < wordCloudWords.length; j++) {
            if (parseFloat(wordCloudScores[j]) < minValue) {
                minValue = parseFloat(wordCloudScores[j]);
            }

            if (parseFloat(wordCloudScores[j]) > maxValue) {
                maxValue = parseFloat(wordCloudScores[j]);
                maxWord = wordCloudWords[j];
            }
        }

        // console.log(`minValue: ${minValue}, maxValue: ${maxValue}`);

        for (let j = 0; j < wordCloudWords.length; j++) {
            wordsCloud.push({
                text: wordCloudWords[j],
                value: maxWord === wordCloudWords[j] ? 1 : (parseFloat(wordCloudScores[j]) / maxValue) - 0.1
            } as WordCloud)
        }

        // console.log('wordsCloud', wordsCloud);

        return wordsCloud;
    }

    const getFormatedDate = (date: string) => {
        const d = new Date(date);

        return d.toLocaleDateString('en-US');
    }

    return (
        <div>
            <div className="box p-ml-2 p-mr-2 p-mt-2 p-p-0" style={{ width: "300px", height: "300px" }} onClick={(e) => window.open(article.url, "_blank")} >
                <ReactWordcloud words={getWordCloudWords(article)} size={size} minSize={size} options={options} />
            </div>
            <h3 className="p-pt-0 p-mt-0">{getFormatedDate(article.published_date)}</h3>
        </div>
    )
}

export default WordCloudComponent;