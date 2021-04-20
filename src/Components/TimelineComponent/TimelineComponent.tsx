import './TimelineComponent.css';
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import { useState } from 'react';
import { Card } from 'primereact/card';

type TimelineComponentProps = {
    articles: ArticleRow[];
}

function TimelineComponent({ articles }: TimelineComponentProps) {
    const [selectedArticle, setSelectedArticle] = useState<ArticleRow>(articles[0]);

    const customizedMarker = (article: ArticleRow) => {
        return (
            <div>
                <span style={{ position: 'absolute', bottom: '70px', left: '-30px' }} className={'p-text-nowrap p-text-left ' + (selectedArticle.url === article.url ? 'p-text-bold' : '')}>{article.published_date}</span>
                <Button icon="pi pi-check"
                    className={'p-button-rounded p-button-timeline ' + (selectedArticle.url === article.url ? 'p-button-success' : '')}
                    onClick={(e) => setSelectedArticle(article)}
                />
            </div>
        );
    };

    const customizedContent = (article: ArticleRow) => {
        return (
            <></>
        );
    };

    return (
        <div className="p-pl-5 p-pr-5 p-pt-5">
            {
                articles.length > 0 &&
                <Timeline value={articles} layout="horizontal" align="top"
                    content={customizedContent} marker={customizedMarker} />
            }
            <Card title={selectedArticle.title} subTitle={selectedArticle.article_summary} className="p-pt-3">
                {selectedArticle.body}
            </Card>
        </div>
    );
}

export default TimelineComponent;
