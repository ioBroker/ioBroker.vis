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
            visUploadedId: 'vis.0.info.uploaded',
            mainGuiProject: 'vis',
        });
        const { browser, page } = await helper.startBrowser(process.env.CI === 'true');
        gBrowser = browser
        gPage = page
        // await helper.createProject();

        // open widgets
        // await helper.palette.openWidgetSet(gPage, 'basic');
        await helper.screenshot(gPage, '02_widgets_opened');
    });

    it('Check runtime', async function (){
        this.timeout(20_000);
        // add widget in editor
        const basicWidgets = await helper.palette.getListOfWidgets(gPage, 'basic');
        // const wid = await helper.palette.addWidget(gPage, basicWidgets[0], true);
        // wait for saving
        // await new Promise(resolve => setTimeout(resolve, 5_000));

        await helper.screenshot(gPage, '90_runtime');

        const runtimePage = await gBrowser.newPage();

        // open runtime
        await runtimePage.goto(`http://127.0.0.1:18082/vis/index.html`, { waitUntil: 'domcontentloaded' });
        await runtimePage.waitForSelector('#root', { timeout: 5_000 });
        // await runtimePage.waitForSelector(`#${wid}`, { timeout: 20_000 });
        await helper.screenshot(runtimePage, '91_runtime');

        await runtimePage.close();
    });

    after(async function () {
        this.timeout(5_000);
        await helper.stopBrowser();
        console.log('BROWSER stopped');
        await helper.stopIoBroker();
        console.log('ioBroker stopped');
    });
});
