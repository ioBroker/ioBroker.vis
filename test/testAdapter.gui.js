const helper = require('@iobroker/vis-2-widgets-testing');

let gPage;
let gBrowser;

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
        const { browser, page } = await helper.startBrowser(process.env.CI === 'true');
        gBrowser = browser
        gPage = page
        await helper.createProject();

        // open widgets
        await helper.palette.openWidgetSet(gPage, 'basic');
        await helper.screenshot(gPage, '02_widgets_opened');
    });

    it('Check all widgets', async function (){
        this.timeout(120_000);
        const widgetSets = await helper.palette.getListOfWidgetSets();
        console.log(`Widget sets found: ${widgetSets.join(', ')}`);
        for (let s = 0; s < widgetSets.length; s++) {
            const widgets = await helper.palette.getListOfWidgets(gPage, widgetSets[s]);
            for (let w = 0; w < widgets.length; w++) {
                const wid = await helper.palette.addWidget(gPage, widgets[w], true);
                await helper.screenshot(gPage, `10_${widgetSets[s]}_${widgets[w]}`);
                await helper.view.deleteWidget(gPage, wid);
            }
        }

        // wait for saving
        await new Promise(resolve => setTimeout(resolve, 10_000));
    });

    it('Check runtime', async function (){
        this.timeout(20_000);
        // add widget in editor
        const basicWidgets = await helper.palette.getListOfWidgets(gPage, 'basic');
        const wid = await helper.palette.addWidget(gPage, basicWidgets[0], true);
        await helper.screenshot(gPage, '90_runtime');

        const runtimePage = await gBrowser.newPage()

        // open runtime
        await runtimePage.goto(`http://127.0.0.1:18082/vis-2/index.html`, { waitUntil: 'domcontentloaded' });
        await runtimePage.waitForSelector('#root', { timeout: 5_000 });
        await runtimePage.waitForSelector(`#${wid}`, { timeout: 20_000 });
        await helper.screenshot(runtimePage, '91_runtime');

        await runtimePage.close()
    });

    after(async function () {
        this.timeout(5_000);
        await helper.stopBrowser();
        console.log('BROWSER stopped');
        await helper.stopIoBroker();
        console.log('ioBroker stopped');
    });
});