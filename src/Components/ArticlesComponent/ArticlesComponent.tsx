import { Paginator } from "primereact/paginator";
import PleaseWaitComponent from "../PleaseWaitComponent/PleaseWaitComponent";
import TimelineComponent from "../TimelineComponent/TimelineComponent";
import WordCloudComponent from "../WordCloudComponent/WordCloudComponent";
import "./ArticlesComponent.css";
import { InputSwitch } from "primereact/inputswitch";
import { useGeneralContext } from "../../Context/Context";
import { MAX_ARTICLE_PER_PAGE_DESKTOP, MAX_ARTICLE_PER_PAGE_MOBILE } from "../../Models/Constants";
import { isMobile } from "react-device-detect";

type ArticlesComponentProps = {
  first: number;
  setFirst: (value: number) => void;
  articles: ArticleRow[];
  articlesCount: number;
  loading: boolean;
};

function ArticlesComponent({
  first,
  setFirst,
  articles,
  articlesCount,
  loading,
}: ArticlesComponentProps) {

  const { isTimelineMode, setIsTimelineMode } = useGeneralContext();

  return (
    <div className="p-pl-1 p p-pr-1 p-mt-0">
      {
        <div className="p-formgroup-inline p-justify-center">
          <div className="p-field-checkbox">
            <label htmlFor="isTimelineMode">
              {isTimelineMode ? "Timeline" : "Word Clouds"}
            </label>
            <InputSwitch
              id="isTimelineMode"
              checked={isTimelineMode}
              onChange={(e) => setIsTimelineMode(e.value)}
            />
          </div>
          {articles.length > 0 && (
            <div>
              <b>Found {articlesCount.toString()} articles</b>
            </div>
          )}
        </div>
      }
      {isTimelineMode ? (
        <TimelineComponent loading={loading} />
      ) : loading ? (
        <PleaseWaitComponent />
      ) : (
        <div>
          <div className="p-d-flex p-flex-wrap p-justify-center">
            {articles.map((article: ArticleRow, index: number) => (
              <WordCloudComponent key={index.toString()} article={article} />
            ))}
          </div>
          {articles.length > 0 && (
            <Paginator
              rows={(isMobile ? MAX_ARTICLE_PER_PAGE_MOBILE : MAX_ARTICLE_PER_PAGE_DESKTOP)}
              totalRecords={articlesCount}
              first={first}
              onPageChange={(e) => setFirst(e.first)}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            ></Paginator>
          )}
        </div>
      )}
    </div>
  );
}

export default ArticlesComponent;
