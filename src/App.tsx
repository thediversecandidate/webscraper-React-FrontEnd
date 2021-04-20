import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import { getArticles, getArticlesCount } from './Services/Api';
import SearchComponent from './Components/SearchComponent/SearchComponent';
import ArticlesComponent from './Components/ArticlesComponent/ArticlesComponent';

function App() {
  const [articles, setArticles] = useState<ArticleRow[]>([])
  const [articlesCount, setArticlesCount] = useState<number>(0)
  const [articlesPerPage, setArticlesPerPage] = useState<number>(10)
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('asc');
  const [loading, setLoading] = useState<boolean>(false);
  const [first, setFirst] = useState<number>(0);

  // const searchFilterTimeout = useRef<number>();

  const fetchArticles = useCallback((searchFilter: string, sortBy: string): void => {

    if (searchFilter.length >= 1) {
      // console.log('fetchArticles');
      // console.log('fetchArticles', first);

      setLoading(true);

      getArticles(searchFilter, first, first + articlesPerPage, sortBy)
        .then((data: any) => {
          let articles = data.data as ArticleRow[];

          // console.log('articles', articles);
          setArticles(articles);
          setLoading(false);
        })
        .catch((err: Error) => {
          console.log(err);
          setLoading(false);
        })
    }
  }, [first, searchFilter, sortBy]);

  // useEffect(() => {
  //   window.clearTimeout(searchFilterTimeout.current);
  //   searchFilterTimeout.current = window.setTimeout(() => {
  //     if (searchFilter.length > 3)
  //       fetchArticles();
  //     window.clearTimeout(searchFilterTimeout.current);
  //   }, 500);
  //   setArticles(TEMP_ARTICLES);
  // }, [searchFilter, maxArticles]);

  useEffect(() => {
    fetchArticles(searchFilter, sortBy);
  }, [first, searchFilter, sortBy]);

  const search = (searchFilter: string, sortBy: string) => {
    setSearchFilter(searchFilter);
    setSortBy(sortBy);

    getArticlesCount(searchFilter)
      .then((data: any) => {
        const newArticlesCount = data.data.count as number;
        // console.log('newArticlesCount', newArticlesCount);
        setArticlesCount(newArticlesCount);
      })
      .catch((err: Error) => {
        console.log(err);
        setLoading(false);
      })

    //fetchArticles(searchFilter);
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
      <SearchComponent search={search} articlesPerPage={articlesPerPage} setArticlesPerPage={setArticlesPerPage} />
      <ArticlesComponent articles={articles} articlesCount={articlesCount}
        loading={loading} first={first} setFirst={setFirst} articlesPerPage={articlesPerPage} />
    </div >
  );
}

export default App;