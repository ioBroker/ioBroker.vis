import React from 'react';

interface DangerousHtmlWithScriptProps {
    /** The passed html */
    html: string;
    /** If true uses a div, else a span */
    isDiv?: boolean;
    /** Any other props passed to the div or span element */
    [other: string]: any;
}

class DangerousHtmlWithScript extends React.Component<DangerousHtmlWithScriptProps> {
    /**
     * Called once if the component is mounted
     */
    componentDidMount(): void {
        const doc = new DOMParser().parseFromString(this.props.html, 'text/html');
        const scriptElements = doc.getElementsByTagName('script');

        for (const scriptElement of Array.from(scriptElements)) {
            // eslint-disable-next-line no-eval
            eval(scriptElement.innerHTML);
        }
    }

    /**
     * Renders the component
     */
    render(): React.JSX.Element {
        const { isDiv, html, ...otherProps } = this.props;

        if (isDiv) {
            // eslint-disable-next-line react/no-danger
            return <div dangerouslySetInnerHTML={{ __html: html }} {...otherProps}></div>;
        }

        // eslint-disable-next-line react/no-danger
        return <span dangerouslySetInnerHTML={{ __html: html }} {...otherProps}></span>;
    }
}

export default DangerousHtmlWithScript;
