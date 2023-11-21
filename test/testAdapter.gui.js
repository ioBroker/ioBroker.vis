const helper = require('@iobroker/vis-2-widgets-testing');

let gPage;

describe('vis', () => {
    before(async function (){
        this.timeout(180_000);

        // install js-controller, web and vis-2
        await helper.startIoBroker({
            startOwnAdapter: true,
            additionalAdapters: ['web'],
            visUploadedId: 'vis-2.0.info.uploaded',
            mainGuiProject: 'vis-2',
        });
        const { page } = await helper.startBrowser(process.env.CI === 'true');
        gPage = page;
        await helper.createProject();

        // open widgets
        await helper.palette.openWidgetSet(null, 'basic');
        await helper.screenshot(null, '02_widgets_opened');
    });

    it('Check all widgets', async function (){
        this.timeout(120_000);
        const widgetSets = await helper.palette.getListOfWidgetSets();
        console.log(`Widget sets found: ${widgetSets.join(', ')}`);
        for (let s = 0; s < widgetSets.length; s++) {
            const widgets = await helper.palette.getListOfWidgets(null, widgetSets[s]);
            for (let w = 0; w < widgets.length; w++) {
                const wid = await helper.palette.addWidget(null, widgets[w], true);
                await helper.screenshot(null, `10_${widgetSets[s]}_${widgets[w]}`);
                await helper.view.deleteWidget(null, wid);
            }
        }

        // wait for saving
        await new Promise(resolve => setTimeout(resolve, 2_000));
    });

    it('Check runtime', async function (){
        this.timeout(120_000);
        // add widget in editor
        const basicWidgets = await helper.palette.getListOfWidgets(null, 'basic');
        const wid = await helper.palette.addWidget(null, basicWidgets[0], true);

        // open runtime
        await gPage.goto(`http://127.0.0.1:18082/vis-2/index.html`, { waitUntil: 'domcontentloaded' });
        await gPage.waitForSelector('#root', { timeout: 5_000 });
        await gPage.waitForSelector(`#${wid}`, { timeout: 1_000 });
        await helper.screenshot(null, '90_runtime');
    });

    after(async function () {
        this.timeout(5_000);
        await helper.stopBrowser();
        console.log('BROWSER stopped');
        await helper.stopIoBroker();
        console.log('ioBroker stopped');
    });
});