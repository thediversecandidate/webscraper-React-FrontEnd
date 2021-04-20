import { Paginator } from 'primereact/paginator';
import React, { useState } from 'react';
import PleaseWaitComponent from '../PleaseWaitComponent/PleaseWaitComponent';
import TimelineComponent from '../TimelineComponent/TimelineComponent';
import WordCloudComponent from '../WordCloudComponent/WordCloudComponent';
import './ArticlesComponent.css';
import { Panel } from 'primereact/panel';

type ArticlesComponentProps = {
    first: number;
    setFirst: (value: number) => void;
    articlesPerPage: number;
    articles: ArticleRow[];
    articlesCount: number;
    loading: boolean;
}

function ArticlesComponent({ first, setFirst, articlesPerPage, articles, articlesCount, loading }: ArticlesComponentProps) {
    const [isTimelineMode, setIsTimelineMode] = useState<boolean>(true);

    return (
        loading ?
            <PleaseWaitComponent />
            :
            <Panel header={isTimelineMode ? 'Timeline' : 'Word Clouds'} toggleable
                collapsed={false} onToggle={() => setIsTimelineMode(!isTimelineMode)} className="p-ml-3"
                collapseIcon="pi pi-eye">
                {
                    <div>
                        {
                            articles.length > 0 &&
                            <div>
                                <b>Found {articlesCount.toString()} articles</b>
                            </div>
                        }
                        {
                            isTimelineMode ?
                                <TimelineComponent articles={articles} />
                                :
                                <div>
                                    <div className="p-d-flex p-flex-wrap p-justify-center">
                                        {
                                            articles.map((article: ArticleRow, index: number) => (
                                                <WordCloudComponent key={index.toString()} article={article} />
                                            ))
                                        }
                                    </div>
                                </div>
                        }
                        {
                            articles.length > 0 &&
                            <Paginator rows={articlesPerPage} totalRecords={articlesCount}
                                first={first} onPageChange={(e) => setFirst(e.first)}
                                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                            ></Paginator>
                        }
                    </div>
                }
            </Panel>
    );
}

export default ArticlesComponent;
