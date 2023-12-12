import React from 'react';

interface DangerousHtmlWithScriptProps {
    /** The passed html */
    html: string;
    /** If true uses a div, else a span */
    isDiv?: boolean;
    /** Any other props passed to the div or span element */
    [other: string]: any;
    /** The parent widget id */
    wid: string;
}

class DangerousHtmlWithScript extends React.Component<DangerousHtmlWithScriptProps> {
    /**
     * Called once if the component is mounted
     * We add our scripts to the body here
     */
    componentDidMount(): void {
        const doc = new DOMParser().parseFromString(this.props.html, 'text/html');
        const scriptElements = doc.getElementsByTagName('script');
        let i = 0;

        const existingScripts = Array.from(document.querySelectorAll("script[type='text/javascript']"));

        for (const scriptElement of Array.from(scriptElements)) {
            const id = `${this.props.wid}-${i++}`;
            const scriptExists = existingScripts.find(script => script.id === id);

            if (scriptExists) {
                return;
            }

            const script = document.createElement('script');
            script.id = id;
            script.type = 'text/javascript';
            script.async = true;
            script.innerHTML = scriptElement.innerHTML;
            document.body.appendChild(script);
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
