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

  const handleLoadMore = useCallback(() => {
    // console.log("handleLoadMore", currentArticles);
    setFirst(currentArticles.length);
  }, [currentArticles, setFirst]);

  useEffect(() => {
    let newCurrentArticles: ArticleRow[] = [];

    if (first === 0) {
      newCurrentArticles = [...articles];
    } else {
      newCurrentArticles = [...currentArticles, ...articles];
    }

    setCurrentArticles(newCurrentArticles);

    const newCurrentItems = newCurrentArticles.map((x, idx) => {
      return {
        title: dayjs(x.published_date).format("D MMMM YYYY"),
        cardTitle: x.title,
        cardSubtitle: x.article_summary,
        cardDetailedText: x.body,
      } as TimelineItemModel;
    });

    setCurrentItems(newCurrentItems);

    // console.log("useEffect => next", {
    //   newCurrentArticles,
    //   newCurrentItems,
    // });
  }, [articles]);

  return (
    <div
      className="p-pl-5 p-pr-5 p-pt-5"
      style={{ height: `${size.height - 210}px` }}
    >
      {currentArticles.length > 0 && (
        <Chrono
          items={currentItems}
          mode="VERTICAL"
          scrollable={{ scrollbar: true }}
          onScrollEnd={handleLoadMore}
          allowDynamicUpdate={true}
        ></Chrono>
      )}
    </div>
  );
}

export default TimelineComponent;
