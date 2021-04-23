import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import { getArticles, getArticlesCount } from './Services/Api';
import SearchComponent from './Components/SearchComponent/SearchComponent';
import ArticlesComponent from './Components/ArticlesComponent/ArticlesComponent';
import { GeneralContext } from './Context/Context';
import { MAX_ARTICLE_PER_PAGE_DESKTOP, MAX_ARTICLE_PER_PAGE_MOBILE } from './Models/Constants';
import { isMobile } from 'react-device-detect';

function App() {
  const [articles, setArticles] = useState<ArticleRow[]>([])
  const [articlesCount, setArticlesCount] = useState<number>(0)
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('asc');
  const [loading, setLoading] = useState<boolean>(false);
  const [first, setFirst] = useState<number>(0);
  const [isTimelineMode, setIsTimelineMode] = useState<boolean>(false);

  // const searchFilterTimeout = useRef<number>();

  const fetchArticles = useCallback((searchFilter: string, sortBy: string): void => {

    if (searchFilter.length >= 1) {
      // console.log('fetchArticles');
      // console.log('fetchArticles', first);

      setLoading(true);

      getArticles(searchFilter, first, first + (isMobile ? MAX_ARTICLE_PER_PAGE_MOBILE : MAX_ARTICLE_PER_PAGE_DESKTOP), sortBy)
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
  }, [first]);

  useEffect(() => {
    fetchArticles(searchFilter, sortBy);
  }, [first, searchFilter, sortBy, fetchArticles]);

  const search = (searchFilter: string, sortBy: string) => {
    setIsTimelineMode(false);
    setFirst(0);
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
  }

  return (
    <GeneralContext.Provider value={{
      articles: articles, first: first, setFirst: setFirst, isTimelineMode, setIsTimelineMode
    }}>
      <div className="App" style={{ overflowX: 'hidden' }}>
        <div className="p-grid">
          <div className="p-col-12 p-p-0" style={{ overflow: 'hidden' }}>
            <SearchComponent search={search} />
          </div>
          <div className="p-col-12">
            {
              searchFilter.length > 0 &&
              <ArticlesComponent articles={articles} articlesCount={articlesCount}
                loading={loading} first={first} setFirst={setFirst} />
            }
          </div>
        </div>
      </div >
    </GeneralContext.Provider>
  );
}

export default App;