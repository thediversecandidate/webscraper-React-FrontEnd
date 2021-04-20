import { Paginator, PaginatorProps } from 'primereact/paginator';
import React from 'react';
import ReactWordcloud, { MinMaxPair, Optional, Options } from 'react-wordcloud';
import PleaseWaitComponent from '../PleaseWaitComponent/PleaseWaitComponent';
import './ArticlesComponent.css';

type ArticlesComponentProps = {
    first: number;
    setFirst: (value: number) => void;
    articlesPerPage: number;
    articles: ArticleRow[];
    articlesCount: number;
    loading: boolean;
}

function ArticlesComponent({ first, setFirst, articlesPerPage, articles, articlesCount, loading }: ArticlesComponentProps) {

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

    const size: MinMaxPair = [300, 300];
    const options: Optional<Options> = {
        fontFamily: "Times New Roman",
        fontWeight: "bold",
        fontSizes: [20, 40],
        rotationAngles: [0, 90],
        rotations: 2,
        enableTooltip: false,
    };

    // const callbacks = {
    //     getWordColor: (word: Word) => {
    //         return word.value === 1 ? "#ee9205" : interpolateColor('8c8d8e', '000000', word.value);
    //     },
    // }

    // const interpolateColor = (a: string, b: string, amount: number) => {

    //     var ah = parseInt(a.replace(/#/g, ''), 16),
    //         ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff,
    //         bh = parseInt(b.replace(/#/g, ''), 16),
    //         br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff,
    //         rr = ar + amount * (br - ar),
    //         rg = ag + amount * (bg - ag),
    //         rb = ab + amount * (bb - ab);

    //     return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
    // }

    const getFormatedDate = (date: string) => {
        const d = new Date(date);

        return d.toLocaleDateString('en-US');
    }

    return (
        loading ?
            <PleaseWaitComponent />
            :
            <div>
                <b className={articles.length === 0 ? 'hidden' : ''}>Found {articlesCount.toString()} articles</b>
                <div className="p-d-flex p-flex-wrap p-justify-center">
                    {
                        articles.map((article: ArticleRow, index: number) => (
                            <div key={index.toString()} >
                                <div className="box p-ml-2 p-mr-2 p-mt-2 p-p-0" style={{ width: "300px", height: "300px" }} onClick={(e) => window.open(article.url, "_blank")} >
                                    <ReactWordcloud words={getWordCloudWords(article)} size={size} minSize={size} options={options} />
                                </div>
                                <h3 className="p-pt-0 p-mt-0">{getFormatedDate(article.published_date)}</h3>
                            </div>
                        ))
                    }
                </div>
                {
                    articles.length > 0 &&
                    <Paginator rows={articlesPerPage} totalRecords={articlesCount}
                        first={first} onPageChange={(e) => setFirst(e.first)}
                        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                    ></Paginator>
                }
            </div>
    );
}

export default ArticlesComponent;
