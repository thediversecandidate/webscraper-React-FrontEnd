import "./TimelineComponent.css";
import React, { useCallback, useEffect, useState } from "react";
import { Chrono } from "react-chrono";
import { TimelineItemModel } from "react-chrono/dist/models/TimelineItemModel";
import { useWindowSize } from "../Helpers/Hooks";
import { useGeneralContext } from "../../Context/Context";
import dayjs from "dayjs";

type TimelineComponentProps = {
  loading: boolean;
};

function TimelineComponent({ loading }: TimelineComponentProps) {
  const { articles, first, setFirst } = useGeneralContext();

  const [currentItems, setCurrentItems] = useState<TimelineItemModel[]>([]);
  const [currentArticles, setCurrentArticles] = useState<ArticleRow[]>([]);

  const size = useWindowSize();

  /**
   * Callback to load more articles when user scrolls to the end of the timeline.
   * Updates pagination index to fetch the next batch of articles.
   */
  const handleLoadMore = useCallback(() => {
    // console.log("handleLoadMore", currentArticles);
    setFirst(currentArticles.length);
  }, [currentArticles, setFirst]);

  /**
   * Effect to sync articles from context with local state and transform them for timeline display.
   * 
   * Dependencies explained:
   * - articles: New articles from API calls trigger updates
   * - currentArticles: Used to append new articles in infinite scroll mode (when first > 0)
   * - first: Determines if we're replacing (first === 0) or appending articles
   * 
   * This ensures the timeline correctly handles:
   * 1. Initial search results (first === 0)
   * 2. Infinite scroll pagination (first > 0)
   * 3. New searches that reset the timeline
   */
  useEffect(() => {
    let newCurrentArticles: ArticleRow[] = [];

    if (first === 0) {
      // Initial load or new search: replace all articles
      newCurrentArticles = [...articles];
    } else {
      // Infinite scroll: append new articles to existing ones
      newCurrentArticles = [...currentArticles, ...articles];
    }

    setCurrentArticles(newCurrentArticles);

    // Transform articles to timeline item format for react-chrono
    const newCurrentItems = Array.isArray(newCurrentArticles) ? newCurrentArticles.map((x, idx) => {
      return {
        title: dayjs(x.published_date).format("D MMM YYYY"),
        cardTitle: x.title,
        // cardSubtitle: x.article_summary,
        cardDetailedText: x.article_summary,
        url: x.url,
      } as TimelineItemModel;
    }) : [];

    setCurrentItems(newCurrentItems);

    console.log("useEffect => next", {
      newCurrentArticles,
      newCurrentItems,
    });
  }, [articles, currentArticles, first]);

  return (
    <div
      className="p-p-0"
      style={{ height: `${size.height - 140}px` }}
    >
      {currentArticles.length > 0 && (
        <Chrono
          items={currentItems}
          mode="VERTICAL"
          scrollable={{ scrollbar: true }}
          onScrollEnd={handleLoadMore}
          allowDynamicUpdate={true}
          cardHeight={100}
        ></Chrono>
      )}
    </div>
  );
}

export default TimelineComponent;
