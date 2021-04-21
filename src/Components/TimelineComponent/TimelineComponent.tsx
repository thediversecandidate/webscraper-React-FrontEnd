import './TimelineComponent.css';
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { MAX_BODY_TEXT_CHARS } from '../../Models/Constants';
import {
    BrowserView,
    MobileView,
    isBrowser,
    isMobile
} from "react-device-detect";

type TimelineComponentProps = {
    articles: ArticleRow[];
}

function TimelineComponent({ articles }: TimelineComponentProps) {
    const customizedMarker = (article: ArticleRow) => {
        return (
            <Button icon="pi pi-check"
                className={'p-button-rounded p-button-timeline'}
            />
        );
    };

    const customizedContent = (article: ArticleRow) => {
        return (
            <Card title={article.title} subTitle={article.published_date}>
                <p>{article.article_summary}</p>
                <Button label="Read more" className="p-button-text p-ml-0 p-pl-0" onClick={() => window.open(article.url, '_blank')}></Button>
            </Card>
        );
    };

    const getBodyTextTruncated = (article: ArticleRow) => {
        if (article.body.length > MAX_BODY_TEXT_CHARS)
            return article.body.substring(0, MAX_BODY_TEXT_CHARS) + '...';
        else
            return article.body;
    }

    return (
        <div className="p-pl-5 p-pr-5 p-pt-5">
            {
                articles.length > 0 &&
                <Timeline value={articles} align="alternate" className="customized-timeline"
                    marker={customizedMarker} content={customizedContent} />

            }
        </div>
    );
}

export default TimelineComponent;
