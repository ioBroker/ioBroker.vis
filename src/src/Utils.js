export const getWidgetTypes = () => {
    if (!window.visWidgetTypes) {
        window.visWidgetTypes = Array.from(document.querySelectorAll('script[type="text/ejs"]'))
            .map(script => ({
                name: script.attributes.id.value,
                set: script.attributes['data-vis-set'] ? script.attributes['data-vis-set'].value : null,
                params: Object.values(script.attributes)
                    .filter(attribute => attribute.name.startsWith('data-vis-attrs'))
                    .map(attribute => attribute.value)
                    .join(''),
            }));
    }

    return window.visWidgetTypes;
};
