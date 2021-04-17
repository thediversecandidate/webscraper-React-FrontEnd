import React, { } from "react";
import './PleaseWaitComponent.css';
import { ProgressBar } from "primereact/progressbar";

type PleaseWaitComponentProps = {
}

const PleaseWaitComponent = ({ }: PleaseWaitComponentProps) => {
    return (
        <div className="p-d-flex p-jc-center">
            <div className="p-d-flex p-flex-column p-pt-3">
                <h2 className="p-m-2 p-p-2 p-as-center">Loading...</h2>
                <ProgressBar mode="indeterminate" style={{ width: '500px' }} />
            </div>
        </div>
    )
}

export default PleaseWaitComponent;