import React, { useCallback, useState } from 'react';
import './App.css';
import { getArticles, getArticlesCount } from './Services/Api';
import ArticlesComponent from './Components/ArticlesComponent';
import SearchComponent from './Components/SearchComponent';

function App() {
  const [articles, setArticles] = useState<ArticleRow[]>([])
  const [articlesCount, setArticlesCount] = useState<number>(0)
  // const searchFilterTimeout = useRef<number>();

  const fetchArticles = (searchFilter: string, maxArticles: number): void => {
    // console.log('fetchArticles');

    getArticlesCount(searchFilter)
      .then((data: any) => {
        const newArticlesCount = data.data.count as number;
        // console.log('newArticlesCount', newArticlesCount);

        getArticles(searchFilter, maxArticles)
          .then((data: any) => {
            let articles = data.data as ArticleRow[];

            // console.log('articles', articles);

            setArticlesCount(newArticlesCount);
            setArticles(articles);
          })
          .catch((err: Error) => console.log(err))
      })
      .catch((err: Error) => console.log(err))
  }

  // useEffect(() => {
  //   window.clearTimeout(searchFilterTimeout.current);
  //   searchFilterTimeout.current = window.setTimeout(() => {
  //     if (searchFilter.length > 3)
  //       fetchArticles();
  //     window.clearTimeout(searchFilterTimeout.current);
  //   }, 500);
  //   setArticles(TEMP_ARTICLES);
  // }, [searchFilter, maxArticles]);

  const search = (searchFilter: string, maxArticles: number) => {
    if (searchFilter.length >= 1)
      fetchArticles(searchFilter, maxArticles);
    // setArticles(TEMP_ARTICLES);
  }

  // const getWordCloudWords = (article: ArticleRow) => {
  //   let wordsCloud: WordCloud[] = [];

  //   let wordCloudWords = article.wordcloud_words.split(' ');
  //   let wordCloudScores = article.wordcloud_scores.split(' ');

  //   let minValue = parseFloat(wordCloudScores[0]);
  //   let maxValue = parseFloat(wordCloudScores[0]);
  //   let maxWord = wordCloudWords[0];

  //   for (let j = 1; j < wordCloudWords.length; j++) {
  //     if (parseFloat(wordCloudScores[j]) < minValue) {
  //       minValue = parseFloat(wordCloudScores[j]);
  //     }

  //     if (parseFloat(wordCloudScores[j]) > maxValue) {
  //       maxValue = parseFloat(wordCloudScores[j]);
  //       maxWord = wordCloudWords[j];
  //     }
  //   }

  //   // console.log(`minValue: ${minValue}, maxValue: ${maxValue}`);

  //   for (let j = 0; j < wordCloudWords.length; j++) {
  //     wordsCloud.push({
  //       text: wordCloudWords[j],
  //       value: parseFloat(wordCloudScores[j])//maxWord === wordCloudWords[j] ? 1 : (parseFloat(wordCloudScores[j]) / maxValue) - 0.01
  //     } as WordCloud)
  //   }

  //   // console.log('wordsCloud', wordsCloud);

  //   return wordsCloud;
  // }

  // const size: MinMaxPair = [300, 300];
  // const options: Optional<Options> = {
  //   fontFamily: "Times New Roman",
  //   fontWeight: "bold",
  //   fontSizes: [20, 40],
  //   rotationAngles: [0, 90],
  //   rotations: 2,
  //   // colors: ['orange', 'black', 'gray', 'lightgray'],
  //   enableTooltip: false,
  // };

  // const callbacks = {
  // getWordColor: (word: Word) => {
  //   return word.value === 1 ? "orange" : interpolateColor('D3D3D3', '696969', word.value);
  // },
  // }

  // const interpolateColor = (a: string, b: string, amount: number) => {

  //   var ah = parseInt(a.replace(/#/g, ''), 16),
  //     ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
  //     bh = parseInt(b.replace(/#/g, ''), 16),
  //     br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
  //     rr = ar + amount * (br - ar),
  //     rg = ag + amount * (bg - ag),
  //     rb = ab + amount * (bb - ab);

  //   return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
  // }

  return (
    <div className="App">
      <SearchComponent search={search} />
      <ArticlesComponent articles={articles} articlesCount={articlesCount} />
    </div >
  );
}

export default App;