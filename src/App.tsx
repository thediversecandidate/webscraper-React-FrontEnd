import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import { getArticles, getArticlesCount } from './Services/Api';
import SearchComponent from './Components/SearchComponent/SearchComponent';
import ArticlesComponent from './Components/ArticlesComponent/ArticlesComponent';
import BackendStatusIndicator from './Components/BackendStatusIndicator/BackendStatusIndicator';
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
      console.log(`[APP] 🚀 Starting search: "${searchFilter}" first=${first} sortBy=${sortBy}`);

      getArticles(searchFilter, first, first + (isMobile ? MAX_ARTICLE_PER_PAGE_MOBILE : MAX_ARTICLE_PER_PAGE_DESKTOP), sortBy)
        .then((data: any) => {
          console.log('[APP] 📦 Raw API Response:', data);
          console.log('[APP] 📦 Response structure:', {
            status: data?.status,
            statusText: data?.statusText,
            dataType: typeof data?.data,
            dataKeys: data?.data ? Object.keys(data.data) : 'no data keys'
          });
          
          // Handle both possible response structures
          let articles: ArticleRow[] = [];
          if (data?.data && Array.isArray(data.data)) {
            articles = data.data as ArticleRow[];
            console.log('[APP] ✅ Articles from data.data:', articles.length);
          } else if (data?.data?.articles && Array.isArray(data.data.articles)) {
            articles = data.data.articles as ArticleRow[];
            console.log('[APP] ✅ Articles from data.data.articles:', articles.length);
          } else if (Array.isArray(data)) {
            articles = data as ArticleRow[];
            console.log('[APP] ✅ Articles from direct data:', articles.length);
          } else {
            console.warn('[APP] ❌ Unexpected API response structure:', {
              dataType: typeof data?.data,
              dataContent: data?.data,
              fullResponse: data
            });
          }

          console.log('[APP] 📋 Final processed articles:', {
            count: articles.length,
            firstArticle: articles[0] ? {
              title: articles[0].title,
              hasWordcloud: !!articles[0].wordcloud_words
            } : 'none'
          });
          setArticles(articles);
          setLoading(false);
        })
        .catch((err: Error) => {
          console.error('[APP] ❌ Search failed:', err);
          console.error('[APP] ❌ Error details:', {
            message: err.message,
            name: err.name,
            stack: err.stack
          });
          console.error('API Error:', err);
          setArticles([]); // Reset to empty array on error
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
          <div className="p-col-12 p-p-0" style={{ overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
              <BackendStatusIndicator />
            </div>
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