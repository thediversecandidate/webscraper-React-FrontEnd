import { Paginator } from "primereact/paginator";
import PleaseWaitComponent from "../PleaseWaitComponent/PleaseWaitComponent";
import TimelineComponent from "../TimelineComponent/TimelineComponent";
import WordCloudComponent from "../WordCloudComponent/WordCloudComponent";
import "./ArticlesComponent.css";
import { InputSwitch } from "primereact/inputswitch";
import { useGeneralContext } from "../../Context/Context";
import { MAX_ARTICLE_PER_PAGE } from "../../Models/Constants";

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
              rows={MAX_ARTICLE_PER_PAGE}
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
