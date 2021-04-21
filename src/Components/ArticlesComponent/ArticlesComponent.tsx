import { Paginator } from 'primereact/paginator';
import React, { useState } from 'react';
import PleaseWaitComponent from '../PleaseWaitComponent/PleaseWaitComponent';
import TimelineComponent from '../TimelineComponent/TimelineComponent';
import WordCloudComponent from '../WordCloudComponent/WordCloudComponent';
import './ArticlesComponent.css';
import { InputSwitch } from 'primereact/inputswitch';

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
            <div className="p-pl-3 p-pr-3">
                {
                    <div className="p-formgroup-inline p-justify-center">
                        <div className="p-field-checkbox">
                            <label htmlFor="isTimelineMode">{isTimelineMode ? 'Timeline' : 'Word Clouds'}</label>
                            <InputSwitch id="isTimelineMode" checked={isTimelineMode} onChange={(e) => setIsTimelineMode(e.value)} />
                        </div>
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
                            {
                                articles.length > 0 &&
                                <Paginator rows={articlesPerPage} totalRecords={articlesCount}
                                    first={first} onPageChange={(e) => setFirst(e.first)}
                                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                                ></Paginator>
                            }
                        </div>
                }
                {
                    articles.length > 0 &&
                    <div className="p-mt-3 p-mb-2">
                        <b>Found {articlesCount.toString()} articles</b>
                    </div>
                }
            </div>
    );
}

export default ArticlesComponent;
