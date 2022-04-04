const gulp       = require('gulp');
const fs         = require('fs');

const visConfig = {
    widgetSets: [
        'bars',
        'basic',
        'consumption',
        'dwd',
        'echarts',
        'eventlist',
        'google-fonts',
        'hqwidgets',
        'jqplot',
        {
            name: 'jqui',
            depends: [
                'basic',
            ],
        },
        {
            name: 'metro',
            depends: [
                'jqui-mfd',
                'basic',
            ],
        },
        'spotify-premium',
        'swipe',
        'tabs',
    ],
};

gulp.task('combineWidgets', done => {
    const widgets = fs.readdirSync(__dirname + '/public/widgets').filter(file => file.endsWith('.html'));
    widgets.sort((a, b) => {
        if (typeof a === 'string' && typeof b === 'string') {
            return 0;
        } else if (typeof a === 'object' && typeof b === 'string') {
            return 1;
        } else if (typeof a === 'string' && typeof b === 'object') {
            return -1;
        } else {
            return 0;
        }
    });
    const files = [];
    widgets.forEach(file => {
        const data = fs.readFileSync(__dirname + '/public/widgets/' + file);
        files.push(`<!-- --------------${file}--- START -->\n` + data.toString() + `\n<!-- --------------${file}--- END -->`);
    });
    fs.writeFileSync(__dirname + '/public/widgets.html', files.join('\n'));
    done();
});

gulp.task('default', gulp.series('combineWidgets'));
