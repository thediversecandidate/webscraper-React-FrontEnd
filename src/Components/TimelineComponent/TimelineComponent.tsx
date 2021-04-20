import React from 'react';
import './TimelineComponent.css';
import { Chrono } from "react-chrono";
import { TimelineItemModel } from 'react-chrono/dist/models/TimelineItemModel';

type TimelineComponentProps = {
    articles: ArticleRow[];
}

function TimelineComponent({ articles }: TimelineComponentProps) {

    let items: TimelineItemModel[] = [];

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];

        items.push({
            title: article.published_date,
            cardTitle: article.title,
            cardSubtitle: article.article_summary,
            cardDetailedText: article.body,
        })
    }

    return (
        <div>
            {
                articles.length > 0 &&
                <Chrono items={items} slideShow slideItemDuration={3000}>
                </Chrono>
            }
        </div>
    );
}

export default TimelineComponent;
