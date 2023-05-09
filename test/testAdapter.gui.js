const helper = require('@iobroker/vis-2-widgets-testing');
const adapterName = require('../package.json').name.split('.').pop();

describe('vis', () => {
    before(async function (){
        this.timeout(180000);
        // install js-controller, web and vis-2-beta
        await helper.startIoBroker({startOwnAdapter: true});
        await helper.startBrowser(process.env.CI === 'true');
        await helper.createProject();

        // open widgets
        await helper.palette.openWidgetSet(null, 'basic');
        await helper.screenshot(null, '02_widgets_opened');
    });

    it('Check all widgets', async function (){
        this.timeout(60000);
        const widgets = await helper.palette.getListOfWidgets(null, 'basic');
        for (let w = 0; w < widgets.length; w++) {
            const wid = await helper.palette.addWidget(null, widgets[w], true);
            await helper.screenshot(null, `10_${widgets[w]}`);
            await helper.view.deleteWidget(null, wid);
        }
    });

    after(async function () {
        this.timeout(5000);
        await helper.stopBrowser();
        console.log('BROWSER stopped');
        await helper.stopIoBroker();
        console.log('ioBroker stopped');
    });
});