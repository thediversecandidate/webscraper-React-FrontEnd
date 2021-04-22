import './TimelineComponent.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Chrono } from "react-chrono";
import { TimelineItemModel } from 'react-chrono/dist/models/TimelineItemModel';
import { useWindowSize } from '../Helpers/Hooks';
import { MAX_BODY_TEXT_CHARS } from '../../Models/Constants';
import { Button } from 'primereact/button';
import { useGeneralContext } from '../../Context/Context';

type TimelineComponentProps = {
    loading: boolean;
}

function TimelineComponent({ loading }: TimelineComponentProps) {
    const { articles, setFirst } = useGeneralContext();

    const [currentItems, setCurrentItems] = useState<TimelineItemModel[]>([])
    const [currentArticles, setCurrentArticles] = useState<ArticleRow[]>([])

    const size = useWindowSize();

    const handleLoadMore = useCallback(() => {
        console.log('handleLoadMore', currentArticles);
        setFirst(currentArticles.length);
    }, [currentArticles, setFirst]);

    useEffect(() => {
        const newArticles = [...currentArticles, ...articles];
        console.log('useEffect => next', newArticles);
        setCurrentArticles(newArticles);

        const newCurrentItems = newArticles.map(x => {
            return {
                title: x.published_date,
            } as TimelineItemModel
        });

        setCurrentItems(newCurrentItems);
    }, [articles]);

    const getTruncatedBodyText = (article: ArticleRow) => {
        if (article.body.length > MAX_BODY_TEXT_CHARS)
            return article.body.substring(0, MAX_BODY_TEXT_CHARS) + '...';
        else
            return article.body;
    }

    console.log('currentItems', currentItems);

    return (
        <div className="p-pl-5 p-pr-5 p-pt-5" style={{ height: `${size.height - 210}px` }}>
            {
                currentArticles.length > 0 &&
                <Chrono
                    items={currentItems}
                    mode="VERTICAL_ALTERNATING"
                    scrollable={{ scrollbar: true }}
                    onScrollEnd={handleLoadMore}
                    allowDynamicUpdate={true}
                    slideShow slideItemDuration={4500}
                >
                    {
                        currentArticles.map((article, index) => (
                            <div key={article.url}>
                                <p className="p-mt-0" style={{ fontSize: '1rem', fontWeight: 600 }}>{index.toString() + ') ' + article.title}</p>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f52ba' }}>{article.article_summary}</p>
                                <p>{getTruncatedBodyText(article)}</p>
                                <div className="p-text-right">
                                    <Button label="Read more" className="p-button-text p-button-plain p-p-0 p-mb-1"
                                        style={{ fontSize: '12px' }}
                                        onClick={() => window.open(article.url, '_blank')}></Button>
                                </div>
                            </div>
                        ))
                    }
                </Chrono>
            }
        </div>
    );
}

export default TimelineComponent;
