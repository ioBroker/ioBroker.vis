const helper = require('@iobroker/vis-2-widgets-testing');
const fs = require('node:fs');
const setup = require("@iobroker/legacy-testing");

let gPage;
let gBrowser;

describe('vis', () => {
    before(async function (){
        this.timeout(180_000);

        // install js-controller, web and vis-2
        await helper.startIoBroker({
            startOwnAdapter: true,
            additionalAdapters: ['web'],
            mainGuiProject: 'vis',
        });

        // wait till web is started
        await new Promise(resolve => setTimeout(resolve, 15_000));

        const { browser, page } = await helper.startBrowser(process.env.CI === 'true');
        gBrowser = browser
        gPage = page

        gPage.on('dialog', async dialog => {
            console.log('here');
            await dialog.accept();
        });
        // await helper.createProject();
        gPage.goto(`http://localhost:18082/vis/index.html`, { waitUntil: 'domcontentloaded' });

        // create screenshots directory
        !fs.existsSync(`${__dirname}/../tmp/screenshots`) && fs.mkdirSync(`${__dirname}/../tmp/screenshots`);

        await new Promise(resolve => setTimeout(resolve, 5_000));
        await gPage.waitForSelector('#menu_body', { timeout: 5_000 });
        // open widgets
        // await helper.palette.openWidgetSet(gPage, 'basic');
        await helper.screenshot(gPage, '02_widgets_opened');
    });

    it('Check runtime', async function (){
        this.timeout(20_000);
        await helper.screenshot(gPage, '90_runtime');

        const runtimePage = await gBrowser.newPage();

        // open runtime
        await runtimePage.goto(`http://127.0.0.1:18082/vis/index.html`, { waitUntil: 'domcontentloaded' });
        await runtimePage.waitForSelector('#vis_container', { timeout: 15_000 });
        // await runtimePage.waitForSelector(`#${wid}`, { timeout: 20_000 });
        await helper.screenshot(runtimePage, '91_runtime');

        await runtimePage.close();
    });

    after(async function () {
        this.timeout(10_000);
        await helper.stopBrowser();
        console.log('BROWSER stopped');
        // await helper.stopIoBroker();
        console.log('Stopping web stopped');
        await setup.stopCustomAdapter('web', 0);
        console.log('Web stopped');

        const pack = require(`${__dirname}/../package.json`);
        const widgetsSetName = pack.name.split('.').pop();
        console.log(`Stopping ${widgetsSetName}`);
        await setup.stopCustomAdapter(widgetsSetName, 0);
        console.log(`${widgetsSetName} topped stopped`);

        // wait till adapters are stopped
        await new Promise(resolve => setTimeout(resolve, 1000));

        await new Promise(resolve =>
            setup.stopController(normalTerminated => {
                console.log(`Adapter normal terminated: ${normalTerminated}`);
                resolve();
            }));
        console.log('ioBroker stopped');
    });
});
