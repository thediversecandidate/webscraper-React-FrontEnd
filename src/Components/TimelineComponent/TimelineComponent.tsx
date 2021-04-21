import './TimelineComponent.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Chrono } from "react-chrono";
import { TimelineItemModel } from 'react-chrono/dist/models/TimelineItemModel';
import { useWindowSize } from '../Helpers/Hooks';
import { MAX_BODY_TEXT_CHARS } from '../../Models/Constants';
import { Button } from 'primereact/button';

type TimelineComponentProps = {
    articles: ArticleRow[];
}

function TimelineComponent({ articles }: TimelineComponentProps) {
    const [items, setItems] = useState<TimelineItemModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const size = useWindowSize();

    const handleAutoLoad = useCallback(() => {

        console.log('handleAutoLoad');

        setLoading(false);

        const newData = getItemsFromArticles(articles);
        setItems([...items, ...newData]);

    }, [items.length]);


    const getItemsFromArticles = (articles: ArticleRow[]): TimelineItemModel[] => {

        let data: TimelineItemModel[] = [];

        for (let i = 0; i < articles.length; i++) {
            const article = articles[0];

            data.push({
                title: article.published_date,
            })
        }

        return data;
    }

    useEffect(() => {
        if (loading) {
            console.log('useEffect');
            handleAutoLoad();
        }
    }, [loading, handleAutoLoad]);

    const handleLoadMore = useCallback(() => {
        console.log('handleLoadMore');
        setLoading(true);
    }, [items.length]);

    const getTruncatedBodyText = (article: ArticleRow) => {
        if (article.body.length > MAX_BODY_TEXT_CHARS)
            return article.body.substring(0, MAX_BODY_TEXT_CHARS) + '...';
        else
            return article.body;
    }

    return (
        <div className="p-pl-5 p-pr-5 p-pt-5" style={{ height: `${size.height - 210}px` }}>
            {
                articles.length > 0 &&
                <Chrono
                    items={items}
                    mode="VERTICAL_ALTERNATING"
                    scrollable={{ scrollbar: true }}
                    onScrollEnd={handleLoadMore}
                    allowDynamicUpdate={true}
                    slideShow slideItemDuration={4500}
                >
                    {
                        articles.map((article) => (
                            <div key={article.url}>
                                <p className="p-mt-0" style={{ fontSize: '1rem', fontWeight: 600 }}>{article.title}</p>
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
