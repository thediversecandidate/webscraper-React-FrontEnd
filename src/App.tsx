import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { getArticles, getArticlesCount, } from './Services/Api';
import ReactWordcloud, { MinMaxPair, Optional, Options } from 'react-wordcloud';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { useCallback } from 'react';

function App() {
  const [articles, setArticles] = useState<ArticleRow[]>([])
  const [articlesCount, setArticlesCount] = useState<number | undefined>(undefined)
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [maxArticles, setMaxArticles] = useState<number>(10)
  const searchFilterTimeout = useRef<number>();

  const fetchArticles = useCallback((): void => {
    console.log('fetchArticles');
    getArticles(searchFilter, maxArticles)
      .then((data: any) => {
        let articles = data.data as ArticleRow[];

        console.log('articles', articles);

        setArticles(articles);
      })
      .catch((err: Error) => console.log(err))

    getArticlesCount(searchFilter)
      .then((data: any) => {
        const newArticlesCount = data.data.count as number;

        console.log('newArticlesCount', newArticlesCount);

        setArticlesCount(newArticlesCount);
      })
      .catch((err: Error) => console.log(err))
    // setArticles(TEMP_ARTICLES);
    // setArticlesCount(TEMP_COUNT_ARTICLES.count);
  }, [maxArticles, searchFilter]);

  useEffect(() => {
    window.clearTimeout(searchFilterTimeout.current);
    searchFilterTimeout.current = window.setTimeout(() => {
      if (searchFilter.length > 3)
        fetchArticles();
      window.clearTimeout(searchFilterTimeout.current);
    }, 500);
    // setArticles(TEMP_ARTICLES);
  }, [searchFilter, maxArticles, fetchArticles]);

  const getWordCloudWords = (article: ArticleRow) => {
    let wordsCloud: WordCloud[] = [];

    let wordCloudWords = article.wordcloud_words.split(' ');
    let wordCloudScores = article.wordcloud_scores.split(' ');

    for (let j = 0; j < wordCloudWords.length; j++) {
      wordsCloud.push({
        text: wordCloudWords[j],
        value: parseInt(wordCloudScores[j])
      } as WordCloud)
    }

    return wordsCloud;
  }

  const size: MinMaxPair = [300, 300];
  const options: Optional<Options> = {
    fontFamily: "Times New Roman",
    fontWeight: "bold",
    fontSizes: [16, 35],
    rotationAngles: [0, 90],
    rotations: 2,
    // colors: ['orange', 'black', 'gray', 'lightgray'],
    enableTooltip: false,
  };

  const callbacks = {
    // getWordColor: (word: Word) => word.value === 5 ? "orange" : "lightgray",
  }

  return (
    <div className="App">
      <div className="p-formgroup-inline p-m-3">
        <div className="p-field">
          <label htmlFor="firstname2">Search for</label>
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText id="searchFilter" style={{ width: '500px' }} value={searchFilter} onChange={(e) => setSearchFilter(e.currentTarget.value)} placeholder="Search" />
          </span>
        </div>
        <div className="p-field">
          <label htmlFor="maxArticles" >Max Articles</label>
          <InputNumber id="maxArticles" style={{ width: '100px' }} value={maxArticles} onValueChange={(e) => setMaxArticles(e.value)} showButtons={true} min={1} max={50} />
        </div>
      </div>
      <div>
        <b>
          {articlesCount && (articlesCount + ' Articles')}
        </b>
      </div>
      <div className="p-d-flex p-flex-wrap">
        {
          articles.map((article: ArticleRow, index: number) => (
            <div key={index} >
              <div className="box p-m-2 p-p-0" style={{ width: "300px", height: "300px" }} onClick={(e) => window.open(article.url, "_blank")} >
                <ReactWordcloud words={getWordCloudWords(article)} size={size} minSize={size} options={options} callbacks={callbacks} />
              </div>
            </div>
          ))
        }
      </div>
    </div >
  );
}

export default App;
